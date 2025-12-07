// Web Worker para mantener el 'latido' de la aplicación
// Intervalo ajustado a 60 segundos por solicitud del usuario par minimizar recursos.

const interval = 60000; // 60 segundos

setInterval(() => {
  self.postMessage({ type: 'tick' });
}, interval);
