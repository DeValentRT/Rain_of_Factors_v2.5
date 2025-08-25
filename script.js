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
  { id: 'layer-name-game', width: 135, height: 240 },
];

// ====== FUNCIÓN DE ESCALADO MEJORADA ======
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
    GAME.elementos.contenedor.style.left = '0'; // Eliminamos posicionamiento absoluto
    GAME.elementos.contenedor.style.top = '0';  // Eliminamos posicionamiento absoluto
    GAME.elementos.contenedor.style.position = 'relative'; // Cambiamos a relativo
}

// Función para redirigir al juego
function BotonPlay() {
  const botonPlay = document.getElementById('btn-play');
  if (botonPlay) {
    // Click para desktop
    botonPlay.addEventListener('click', () => {
        setTimeout(() => {
            window.location.href = 'Rain_of_Factors.html';
        }, GAME.animacion.duracion);
    });
    
    // Touch para móvil
    botonPlay.addEventListener('touchstart', (e) => {
        e.preventDefault();
        botonPlay.style.transform = 'scale(0.9)';
    }, { passive: false });
    
    botonPlay.addEventListener('touchend', (e) => {
        e.preventDefault();
        setTimeout(() => {
            window.location.href = 'Rain_of_Factors.html';
        }, GAME.animacion.duracion);
        botonPlay.style.transform = 'scale(1)';
    });
  }
}

// Animación del botón play
function animarBotonPlay() {
  const botonPlay = document.getElementById('btn-play');
  let frame = 1;

  setInterval(() => {
    frame = frame === 1 ? 2 : 1;
    botonPlay.src = `play/frame${frame}.png`;
  }, 800);
}

// ====== INICIALIZACIÓN ======
function init() {
    BotonPlay();
    animarBotonPlay();
    ajustarEscala();
    window.addEventListener('resize', ajustarEscala);
    window.addEventListener('orientationchange', ajustarEscala);
}

document.addEventListener('DOMContentLoaded', init);