// Web Worker para "Latido" y Sincronización del Relevo
// Intervalo: 10 segundos.
// Necesario para disparar el evento de "relevo" (switch) a los 290s (4:50) con precisión aceptable.

const interval = 10000; // 10 segundos

setInterval(() => {
  self.postMessage({ type: 'tick' });
}, interval);
