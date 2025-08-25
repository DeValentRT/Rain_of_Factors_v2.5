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
  { id: 'layer-final', width: 135, height: 240 },
];

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
    
    GAME.elementos.contenedor.style.transform = `scale(${scale})`;
    GAME.elementos.contenedor.style.left = '0';
    GAME.elementos.contenedor.style.top = '0';
    GAME.elementos.contenedor.style.position = 'relative';
}

// Función para configurar la imagen final según el resultado
function configurarImagenFinal() {
  const layerFinal = document.getElementById('layer-final');
  const resultado = localStorage.getItem('resultadoJuego');
  
  if (resultado === 'victoria') {
    layerFinal.src = 'background_final1.png'; // Imagen de victoria
  } else if (resultado === 'derrota') {
    layerFinal.src = 'background_final2.png'; // Imagen de derrota
  } else {
    // Si no hay resultado, redirigir al inicio
    window.location.href = 'index.html';
  }
}

// Función para mostrar el tiempo
function mostrarTiempo() {
  const tiempoGuardado = localStorage.getItem('tiempoJuego');
  if (tiempoGuardado) {
    const segundos = parseInt(tiempoGuardado);
    const tiempoFormateado = formatearTiempo(segundos);
    
    // Crear elemento para mostrar el tiempo
    const tiempoElemento = document.createElement('div');
    tiempoElemento.className = 'tiempo-resultado';
    tiempoElemento.textContent = `${tiempoFormateado}`;
    tiempoElemento.style.cssText = `
      position: absolute;
      top: 129px;
      left: 0px;
      width: 100%;
      text-align: center;
      color: white;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 12px;
      z-index: 15;
      image-rendering: pixelated;
      font-weight: bold;
      letter-spacing: 1px;
      scale: 1.3;
    `;
    
    document.getElementById('game-container').appendChild(tiempoElemento);
  }
}

// Función para mostrar el contador de tarjetas
function mostrarTarjetas() {
  const tarjetasGuardadas = localStorage.getItem('contadorTarjetas');
  if (tarjetasGuardadas) {
    const tarjetas = parseInt(tarjetasGuardadas);
    
    // Crear elemento para mostrar el contador de tarjetas
    const tarjetasElemento = document.createElement('div');
    tarjetasElemento.className = 'tarjetas-resultado';
    tarjetasElemento.textContent = `${tarjetas}`;
    tarjetasElemento.style.cssText = `
      position: absolute;
      top: 161px;
      left: 3px;
      width: 100%;
      text-align: center;
      color: white;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 10px;
      z-index: 15;
      image-rendering: pixelated;
      font-weight: bold;
      letter-spacing: 0.5px;
      scale: 1.1;
    `;
    
    document.getElementById('game-container').appendChild(tarjetasElemento);
  }
}

// Función para formatear el tiempo (MM:SS)
function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;
  return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
}

// Botón home
function volverAIndex() {
  // Limpiar resultado antes de volver
  localStorage.removeItem('resultadoJuego');
  // Redirigir a index.html
  window.location.href = 'index.html';
}

// Botón reset
function volverAGame() {
  // Limpiar resultado antes de volver
  localStorage.removeItem('resultadoJuego');
  // Redirigir al juego
  window.location.href = 'Rain_of_Factors.html';
}

// ====== MANEJO DE BOTONES CON FEEDBACK TÁCTIL ======
function configurarBotones() {
  const btnVolver = document.getElementById('btn-home');
  const btnReset = document.getElementById('btn-reset');
  
  if (btnVolver) {
    // Click para desktop
    btnVolver.addEventListener('click', volverAIndex);
    
    // Touch para móvil
    btnVolver.addEventListener('touchstart', (e) => {
      e.preventDefault();
      btnVolver.style.transform = 'scale(0.85)';
    }, { passive: false });
    
    btnVolver.addEventListener('touchend', (e) => {
      e.preventDefault();
      setTimeout(volverAIndex, GAME.animacion.duracion);
      btnVolver.style.transform = 'scale(1)';
    });
  }
  
  if (btnReset) {
    // Click para desktop
    btnReset.addEventListener('click', volverAGame);
    
    // Touch para móvil
    btnReset.addEventListener('touchstart', (e) => {
      e.preventDefault();
      btnReset.style.transform = 'scale(0.85)';
    }, { passive: false });
    
    btnReset.addEventListener('touchend', (e) => {
      e.preventDefault();
      setTimeout(volverAGame, GAME.animacion.duracion);
      btnReset.style.transform = 'scale(1)';
    });
  }
}

// ====== INICIALIZACIÓN ======
function init() {
  ajustarEscala();
  configurarImagenFinal();
  mostrarTiempo();
  mostrarTarjetas();
  configurarBotones();
  
  window.addEventListener('resize', ajustarEscala);
  window.addEventListener('orientationchange', ajustarEscala);
}

document.addEventListener('DOMContentLoaded', init);