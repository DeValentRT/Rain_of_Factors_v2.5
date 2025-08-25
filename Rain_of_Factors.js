// ====== CONFIGURACIÓN ======
const GAME = {
    elementos: {
        contenedor: document.getElementById('game-container')
    },
    dimensiones: {
        ancho: 135,
        alto: 240
    },
    animacion: {
        duracion: 150 // ms
    }
};

// Configuración de capas
const layers = [
  { id: 'layer-background1', width: 135, height: 240 },
  { id: 'layer-background2', width: 135, height: 240 },
  { id: 'layer-interfaz', width: 135, height: 240 },  
];

// Variables globales
let tarjetasActivas = [];
let tarjetasEnSuelo = [];
let scaleFactor = 1;
let tarjetaActual = null;
let esperandoNuevaTarjeta = true;
let caidaRapidaActiva = false;
let juegoActivo = true;
let primeraTarjetaColocada = false;
let resultadoJuego = null;
let tiempoInicio = null;
let tiempoTranscurrido = 0;
let temporizadorInterval = null;
let proximoExponente = null;
let indicadorProximoExponente = null;
let contadorTarjetas = 0;

// Configuración de movimiento
const VELOCIDAD_CAIDA_NORMAL = 0.9;
const VELOCIDAD_CAIDA_RAPIDA = 3.5;
const VELOCIDAD_MOVIMIENTO = 18;
const COLUMNAS = 4;
const POSICIONES_X = [8, 42, 76, 109];

// ====== FUNCIÓN DE ESCALADO MEJORADA (COMO MOCHILA) ======
function ajustarEscala() {
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = GAME.dimensiones.ancho / GAME.dimensiones.alto;
    let scale;
    
    if (windowRatio > gameRatio) {
        // La ventana es más ancha que el juego
        scale = window.innerHeight / GAME.dimensiones.alto;
    } else {
        // La ventana es más alta que el juego
        scale = window.innerWidth / GAME.dimensiones.ancho;
    }
    
    scaleFactor = scale;
    GAME.elementos.contenedor.style.transform = `scale(${scale})`;
    GAME.elementos.contenedor.style.left = '0';
    GAME.elementos.contenedor.style.top = '0';
    GAME.elementos.contenedor.style.position = 'relative';
}

// Función para iniciar el temporizador
function iniciarTemporizador() {
  tiempoInicio = Date.now();
  temporizadorInterval = setInterval(actualizarTemporizador, 1000);
}

// Función para actualizar el temporizador
function actualizarTemporizador() {
  if (tiempoInicio && juegoActivo) {
    tiempoTranscurrido = Math.floor((Date.now() - tiempoInicio) / 1000);
    console.log(`Tiempo: ${formatearTiempo(tiempoTranscurrido)}`);
  }
}

// Función para formatear el tiempo (MM:SS)
function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;
  return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
}

// Función para detener el temporizador
function detenerTemporizador() {
  if (temporizadorInterval) {
    clearInterval(temporizadorInterval);
    temporizadorInterval = null;
  }
}

// Función para predecir el próximo exponente
function predecirProximoExponente() {
  const esPositiva = Math.random() > 0.5;
  const id = Math.floor(Math.random() * 6) + 1;
  return esPositiva ? id : -id;
}

// Función para crear el elemento del indicador
function crearIndicadorProximoExponente() {
  const container = document.getElementById('game-container');
  
  // Crear elemento para mostrar el próximo exponente
  indicadorProximoExponente = document.createElement('div');
  indicadorProximoExponente.id = 'proximo-exponente';
  indicadorProximoExponente.textContent = 'Próximo: ?';
  
  // Aplicar estilos
  indicadorProximoExponente.style.cssText = `
    position: absolute;
    top: 2px;
    left: 92px;
    color: white;
    font-family: 'Press Start 2P', 'Courier New', monospace;
    font-size: 8px;
    z-index: 20;
    background-color: rgba(255, 240, 240, 0.07);
    padding: 4px 6px;
    border-radius: 4px;
    image-rendering: pixelated;
    pointer-events: none;
    transform: scale(0.9);
  `;
  
  container.appendChild(indicadorProximoExponente);
}

// Función para actualizar el indicador
function actualizarIndicadorProximoExponente() {
  if (indicadorProximoExponente) {
    const signo = proximoExponente > 0 ? '+' : '';
    indicadorProximoExponente.textContent = `x^${signo}${proximoExponente}`;
  }
}

// Modificar la función crearNuevaTarjeta para usar el exponente predecido
function crearNuevaTarjeta() {
  if (tarjetaActual !== null || !juegoActivo) return;
  
  const container = document.getElementById('game-container');
  
  // Seleccionar una columna aleatoria (1-4)
  const columnaInicial = Math.floor(Math.random() * 4) + 1;
  
  // Obtener referencias a las hitboxes
  const hitboxSuperior = document.getElementById(`hitbox-superior-${columnaInicial}`);
  const hitboxInferior = document.getElementById(`hitbox-inferior-${columnaInicial}`);
  
  // Usar el exponente que ya predecimos
  const exponente = proximoExponente;
  const valorAbsoluto = Math.abs(exponente);
  const esPositiva = exponente > 0;
  const tarjetaId = esPositiva ? `tarjeta-exp${valorAbsoluto}` : `tarjeta-exp-${valorAbsoluto}`;
  const original = document.getElementById(tarjetaId);
  
  // Predecir el próximo exponente para la siguiente tarjeta
  proximoExponente = predecirProximoExponente();
  actualizarIndicadorProximoExponente();
  
  // Crear clon de la tarjeta
  const tarjeta = original.cloneNode(true);
  
  // Hacer visible la tarjeta
  tarjeta.style.display = 'block';
  tarjeta.dataset.columna = columnaInicial;
  tarjeta.dataset.exponente = exponente;
  tarjeta.dataset.estado = 'cayendo';
  
  // Obtener posiciones relativas al contenedor
  const containerRect = container.getBoundingClientRect();
  const hitboxSuperiorRect = hitboxSuperior.getBoundingClientRect();
  const hitboxInferiorRect = hitboxInferior.getBoundingClientRect();
  
  // Calcular posición inicial (ajustada por escala)
  const posX = (hitboxSuperiorRect.left - containerRect.left) / scaleFactor;
  const posYInicial = (hitboxSuperiorRect.top - containerRect.top) / scaleFactor;
  const posYFinal = (hitboxInferiorRect.top - containerRect.top) / scaleFactor;
  
  // Aplicar posición inicial
  tarjeta.style.left = `${posX}px`;
  tarjeta.style.top = `${posYInicial}px`;
  
  // Añadir al contenedor
  container.appendChild(tarjeta);
  
  // Crear objeto de control para la tarjeta
  tarjetaActual = {
    element: tarjeta,
    columna: columnaInicial,
    exponente: exponente,
    posX: posX,
    posY: posYInicial,
    velocidad: VELOCIDAD_CAIDA_NORMAL,
    objetivoY: posYFinal,
    llegada: false
  };
  
  // Incrementar el contador de tarjetas
  contadorTarjetas++;
  console.log(`Tarjeta #${contadorTarjetas} creada: exponente ${tarjetaActual.exponente} en columna ${columnaInicial}`);
  
  // Registrar tarjeta activa
  tarjetasActivas.push(tarjetaActual);
  esperandoNuevaTarjeta = false;
}

// Función para verificar victoria
function verificarVictoria() {
  // Solo verificar victoria después de que se haya colocado al menos una tarjeta
  if (!primeraTarjetaColocada) return false;
  
  // Verificar si no hay tarjetas en juego NI en el suelo
  if (tarjetasActivas.length === 0 && tarjetasEnSuelo.length === 0 && juegoActivo) {
    console.log("¡Condiciones de victoria detectadas!");
    return true;
  }
  return false;
}

// Función de animación
function animarTarjetas() {
  if (!juegoActivo) return;
  
  // Crear una nueva tarjeta si no hay una activa y estamos esperando
  if (tarjetaActual === null && esperandoNuevaTarjeta) {
    // Pequeño delay para asegurar que las animaciones de eliminación terminen
    setTimeout(() => {
      if (esperandoNuevaTarjeta && juegoActivo) {
        // VERIFICAR VICTORIA antes de crear nueva tarjeta
        if (verificarVictoria()) {
          victoria();
        } else {
          crearNuevaTarjeta();
        }
      }
    }, 100);
  }
  
  // Animar las tarjetas activas
  for (let i = tarjetasActivas.length - 1; i >= 0; i--) {
    const tarjeta = tarjetasActivas[i];
    
    // Mover la tarjeta hacia abajo
    tarjeta.posY += tarjeta.velocidad;
    tarjeta.element.style.top = `${tarjeta.posY}px`;
    
    // Verificar si ha llegado a la hitbox inferior
    verificarColision(tarjeta);
  }
  
  // Continuar la animación
  requestAnimationFrame(animarTarjetas);
}

// Función de victoria
function victoria() {
  juegoActivo = false;
  resultadoJuego = 'victoria';
  detenerTemporizador(); // Detener temporizador
  tiempoTranscurrido = Math.floor((Date.now() - tiempoInicio) / 1000);
  
  console.log(`¡Victoria! Tiempo: ${formatearTiempo(tiempoTranscurrido)}, Tarjetas: ${contadorTarjetas}`);
  
  // Guardar estado, tiempo y contador en localStorage
  localStorage.setItem('resultadoJuego', 'victoria');
  localStorage.setItem('tiempoJuego', tiempoTranscurrido.toString());
  localStorage.setItem('contadorTarjetas', contadorTarjetas.toString());
  
  // Redirigir después de un pequeño delay
  setTimeout(() => {
    window.location.href = 'Interfaz_final.html';
  }, 1000);
}

// Función para procesar combinación de tarjetas
function procesarCombinacion(nuevaTarjeta) {
  const carril = nuevaTarjeta.columna;
  
  // Buscar si ya hay una tarjeta en este carril
  const tarjetaExistenteIndex = tarjetasEnSuelo.findIndex(t => t.columna === carril);
  
  if (tarjetaExistenteIndex === -1) {
    // No hay tarjeta en este carril, simplemente colocar
    tarjetasEnSuelo.push(nuevaTarjeta);
    return true;
  }
  
  const tarjetaExistente = tarjetasEnSuelo[tarjetaExistenteIndex];
  
  // Calcular nuevo exponente
  const nuevoExponente = tarjetaExistente.exponente + nuevaTarjeta.exponente;
  
  console.log(`Combinación: ${tarjetaExistente.exponente} + ${nuevaTarjeta.exponente} = ${nuevoExponente}`);
  
  // Verificar game over
  if (Math.abs(nuevoExponente) > 6) {
    gameOver(`¡Game Over! Combinación inválida: x^${nuevoExponente}`);
    return false;
  }
  
  // Eliminar la tarjeta que estaba cayendo (siempre se elimina)
  if (nuevaTarjeta.element && nuevaTarjeta.element.parentNode) {
    nuevaTarjeta.element.parentNode.removeChild(nuevaTarjeta.element);
  }
  
  if (nuevoExponente === 0) {
    // Combinación perfecta - eliminar ambas tarjetas
    eliminarTarjeta(tarjetaExistente);
    console.log(`Combinación perfecta! Tarjetas eliminadas del carril ${carril}`);
  } else {
    // Reemplazar la tarjeta existente con una NUEVA tarjeta del resultado
    reemplazarTarjeta(tarjetaExistente, nuevoExponente);
    console.log(`Tarjeta reemplazada en carril ${carril}: x^${nuevoExponente}`);
  }
  
  return true;
}

// Función para reemplazar una tarjeta existente por una nueva
function reemplazarTarjeta(tarjetaVieja, nuevoExponente) {
  const container = document.getElementById('game-container');
  const valorAbsoluto = Math.abs(nuevoExponente);
  const esPositivo = nuevoExponente > 0;
  const tarjetaId = esPositivo ? `tarjeta-exp${valorAbsoluto}` : `tarjeta-exp-${valorAbsoluto}`;
  const original = document.getElementById(tarjetaId);
  
  // Crear nueva tarjeta
  const nuevaTarjetaElement = original.cloneNode(true);
  nuevaTarjetaElement.style.display = 'block';
  nuevaTarjetaElement.dataset.columna = tarjetaVieja.columna;
  nuevaTarjetaElement.dataset.exponente = nuevoExponente;
  nuevaTarjetaElement.dataset.estado = 'suelo';
  
  // Posicionar en el mismo lugar que la tarjeta vieja
  nuevaTarjetaElement.style.left = `${tarjetaVieja.posX}px`;
  nuevaTarjetaElement.style.top = `${tarjetaVieja.objetivoY}px`;
  
  // Reemplazar en el DOM
  if (tarjetaVieja.element && tarjetaVieja.element.parentNode) {
    tarjetaVieja.element.parentNode.replaceChild(nuevaTarjetaElement, tarjetaVieja.element);
  } else {
    container.appendChild(nuevaTarjetaElement);
  }
  
  // Actualizar el objeto de tarjeta
  tarjetaVieja.element = nuevaTarjetaElement;
  tarjetaVieja.exponente = nuevoExponente;
}

// Función para eliminar una tarjeta
function eliminarTarjeta(tarjeta) {
  // Remover visualmente
  if (tarjeta.element && tarjeta.element.parentNode) {
    tarjeta.element.parentNode.removeChild(tarjeta.element);
  }
  
  // Remover del array
  tarjetasEnSuelo = tarjetasEnSuelo.filter(t => t !== tarjeta);
}

// Función para actualizar una tarjeta existente
function actualizarTarjeta(tarjeta, nuevoExponente) {
  // Actualizar datos
  tarjeta.exponente = nuevoExponente;
  tarjeta.element.dataset.exponente = nuevoExponente;
  
  // Actualizar imagen
  const valorAbsoluto = Math.abs(nuevoExponente);
  const esPositivo = nuevoExponente > 0;
  const nuevaImagen = `tarjeta/${esPositivo ? '' : '-'}${valorAbsoluto}.png`;
  tarjeta.element.src = nuevaImagen;
}

// Función de Game Over
function gameOver(mensaje) {
  juegoActivo = false;
  resultadoJuego = 'derrota';
  detenerTemporizador(); // Detener temporizador
  tiempoTranscurrido = Math.floor((Date.now() - tiempoInicio) / 1000);
  
  console.log(`${mensaje} Tiempo: ${formatearTiempo(tiempoTranscurrido)}, Tarjetas: ${contadorTarjetas}`);
  
  // Guardar estado, tiempo y contador en localStorage
  localStorage.setItem('resultadoJuego', 'derrota');
  localStorage.setItem('tiempoJuego', tiempoTranscurrido.toString());
  localStorage.setItem('contadorTarjetas', contadorTarjetas.toString());
  
  // Redirigir después de un pequeño delay
  setTimeout(() => {
    window.location.href = 'Interfaz_final.html';
  }, 1000);
}

// Función para invertir el signo de la tarjeta actual
function invertirTarjeta() {
  if (tarjetaActual === null || tarjetaActual.llegada || !juegoActivo) return;
  
  // Cambiar el signo del exponente
  const nuevoExponente = -tarjetaActual.exponente;
  tarjetaActual.exponente = nuevoExponente;
  tarjetaActual.element.dataset.exponente = nuevoExponente;
  
  // Cambiar la imagen de la tarjeta
  const nuevoId = Math.abs(nuevoExponente);
  const esPositivo = nuevoExponente > 0;
  const nuevaImagen = `tarjeta/${esPositivo ? '' : '-'}${nuevoId}.png`;
  tarjetaActual.element.src = nuevaImagen;
  
  console.log(`Tarjeta invertida: ahora es x^${nuevoExponente}`);
}

// Función para activar la caída rápida
function activarCaidaRapida() {
  if (tarjetaActual === null || tarjetaActual.llegada || !juegoActivo) return;
  
  caidaRapidaActiva = true;
  tarjetaActual.velocidad = VELOCIDAD_CAIDA_RAPIDA;
}

// Función para desactivar la caída rápida
function desactivarCaidaRapida() {
  if (tarjetaActual === null || tarjetaActual.llegada || !juegoActivo) return;
  
  caidaRapidaActiva = false;
  tarjetaActual.velocidad = VELOCIDAD_CAIDA_NORMAL;
}

// Función para mover la tarjeta actual a la izquierda
function moverIzquierda() {
  if (tarjetaActual === null || tarjetaActual.llegada || !juegoActivo) return;
  
  const nuevaColumna = tarjetaActual.columna - 1;
  if (nuevaColumna >= 1) {
    // Actualizar la columna
    tarjetaActual.columna = nuevaColumna;
    tarjetaActual.element.dataset.columna = nuevaColumna;
    
    // Calcular nueva posición X
    const nuevaPosX = POSICIONES_X[nuevaColumna - 1];
    tarjetaActual.posX = nuevaPosX;
    tarjetaActual.element.style.left = `${nuevaPosX}px`;
    
    // Actualizar objetivo Y (por si cambia la hitbox)
    const container = document.getElementById('game-container');
    const hitboxInferior = document.getElementById(`hitbox-inferior-${nuevaColumna}`);
    const containerRect = container.getBoundingClientRect();
    const hitboxInferiorRect = hitboxInferior.getBoundingClientRect();
    tarjetaActual.objetivoY = (hitboxInferiorRect.top - containerRect.top) / scaleFactor;
    
    console.log(`Tarjeta movida a columna ${nuevaColumna}`);
  }
}

// Función para mover la tarjeta actual a la derecha
function moverDerecha() {
  if (tarjetaActual === null || tarjetaActual.llegada || !juegoActivo) return;
  
  const nuevaColumna = tarjetaActual.columna + 1;
  if (nuevaColumna <= COLUMNAS) {
    // Actualizar la columna
    tarjetaActual.columna = nuevaColumna;
    tarjetaActual.element.dataset.columna = nuevaColumna;
    
    // Calcular nueva posición X
    const nuevaPosX = POSICIONES_X[nuevaColumna - 1];
    tarjetaActual.posX = nuevaPosX;
    tarjetaActual.element.style.left = `${nuevaPosX}px`;
    
    // Actualizar objetivo Y (por si cambia la hitbox)
    const container = document.getElementById('game-container');
    const hitboxInferior = document.getElementById(`hitbox-inferior-${nuevaColumna}`);
    const containerRect = container.getBoundingClientRect();
    const hitboxInferiorRect = hitboxInferior.getBoundingClientRect();
    tarjetaActual.objetivoY = (hitboxInferiorRect.top - containerRect.top) / scaleFactor;
    
    console.log(`Tarjeta movida a columna ${nuevaColumna}`);
  }
}

// Configurar event listeners para los botones
function configurarControles() {
  const btnIzquierda = document.getElementById('btn-izquierda');
  const btnDerecha = document.getElementById('btn-derecha');
  const btnAbajo = document.getElementById('btn-abajo');
  const btnInverso = document.getElementById('btn-inverso');
  
  // Eventos para clic
  btnIzquierda.addEventListener('click', moverIzquierda);
  btnDerecha.addEventListener('click', moverDerecha);
  btnInverso.addEventListener('click', invertirTarjeta);
  
  // Eventos para botón abajo (presionar y soltar)
  btnAbajo.addEventListener('mousedown', activarCaidaRapida);
  btnAbajo.addEventListener('mouseup', desactivarCaidaRapida);
  btnAbajo.addEventListener('mouseleave', desactivarCaidaRapida);
  
  // Eventos para touch (móviles)
  btnIzquierda.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moverIzquierda();
  });
  
  btnDerecha.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moverDerecha();
  });
  
  btnInverso.addEventListener('touchstart', (e) => {
    e.preventDefault();
    invertirTarjeta();
  });
  
  btnAbajo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    activarCaidaRapida();
  });
  
  btnAbajo.addEventListener('touchend', (e) => {
    e.preventDefault();
    desactivarCaidaRapida();
  });
  
  // Eventos de teclado para computadora
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      moverIzquierda();
    } else if (e.key === 'ArrowRight') {
      moverDerecha();
    } else if (e.key === 'ArrowDown') {
      activarCaidaRapida();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      invertirTarjeta();
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown') {
      desactivarCaidaRapida();
    }
  });
}

// Función para verificar colisión
function verificarColision(tarjeta) {
  if (tarjeta.llegada) return true;
  
  if (tarjeta.posY >= tarjeta.objetivoY) {
    // La tarjeta ha llegado a su destino
    tarjeta.llegada = true;
    tarjeta.element.dataset.estado = 'suelo';
    
    // Ajustar posición final para que quede exactamente en la hitbox
    tarjeta.element.style.top = `${tarjeta.objetivoY}px`;
    
    // Restaurar velocidad normal por si estaba en caída rápida
    tarjeta.velocidad = VELOCIDAD_CAIDA_NORMAL;
    caidaRapidaActiva = false;
    
    // Marcar que ya se colocó al menos una tarjeta
    primeraTarjetaColocada = true;
    
    // Procesar combinación con tarjeta existente (si hay)
    const combinacionExitosa = procesarCombinacion(tarjeta);
    
    // Siempre removemos de tarjetas activas
    tarjetasActivas = tarjetasActivas.filter(t => t !== tarjeta);
    
    // Liberar la tarjeta actual para permitir una nueva
    tarjetaActual = null;
    
    // Indicar que estamos listos para una nueva tarjeta
    esperandoNuevaTarjeta = true;
    
    return true;
  }
  
  return false;
}

// ====== INICIALIZACIÓN ======
function init() {
  ajustarEscala();
  
  // Crear el indicador de próximo exponente
  crearIndicadorProximoExponente();
  
  // Predecir el primer exponente
  proximoExponente = predecirProximoExponente();
  actualizarIndicadorProximoExponente();
  
  // Configurar controles
  configurarControles();
  
  // Iniciar temporizador
  iniciarTemporizador();
  
  // Iniciar la animación de tarjetas
  requestAnimationFrame(animarTarjetas);
  
  // Crear una tarjeta inicial después de un breve delay
  setTimeout(() => {
    esperandoNuevaTarjeta = true;
  }, 1000);
  
  window.addEventListener('resize', () => {
    ajustarEscala();
    
    // Recalcular posiciones de todas las tarjetas
    const container = document.getElementById('game-container');
    const containerRect = container.getBoundingClientRect();
    
    // Para tarjetas activas (cayendo)
    tarjetasActivas.forEach(tarjeta => {
      const hitboxInferior = document.getElementById(`hitbox-inferior-${tarjeta.columna}`);
      const hitboxInferiorRect = hitboxInferior.getBoundingClientRect();
      tarjeta.objetivoY = (hitboxInferiorRect.top - containerRect.top) / scaleFactor;
    });
    
    // Para tarjetas en suelo (ya colocadas)
    tarjetasEnSuelo.forEach(tarjeta => {
      const hitboxInferior = document.getElementById(`hitbox-inferior-${tarjeta.columna}`);
      const hitboxInferiorRect = hitboxInferior.getBoundingClientRect();
      tarjeta.posY = (hitboxInferiorRect.top - containerRect.top) / scaleFactor;
      tarjeta.element.style.top = `${tarjeta.posY}px`;
    });
  });
}

document.addEventListener('DOMContentLoaded', init);