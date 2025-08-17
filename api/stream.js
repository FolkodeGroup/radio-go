// /api/stream.mjs o /api/stream.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // URL CORRECTA del stream, según el panel de Azuracast.
  const STREAM_URL = 'http://138.199.234.123:8020/stream';

  try {
    const proxyRes = await fetch(STREAM_URL, {
      headers: {
        ...req.headers,
        host: new URL(STREAM_URL).host,
      },
    });

    if (!proxyRes.ok) {
      return res.status(proxyRes.status).send(proxyRes.statusText);
    }

    // Pasamos las cabeceras originales del stream al cliente (navegador).
    res.writeHead(proxyRes.status, Object.fromEntries(proxyRes.headers.entries()));

    // Conectamos directamente la respuesta del stream a la respuesta del cliente.
    proxyRes.body.pipe(res);

  } catch (error) {
    console.error('Error en el proxy de streaming:', error);
    res.status(500).send('Error al conectar con el servidor de streaming.');
  }
}