// /api/stream.mjs
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // LA URL PÚBLICA Y CORRECTA DEL STREAM DE AZURACAST
  const STREAM_URL = 'https://cast4.prosandoval.com/listen/radio_go/radio.mp3';

  try {
    const proxyRes = await fetch(STREAM_URL, {
      headers: {
        ...req.headers,
        host: new URL(STREAM_URL).host,
      },
    });

    if (!proxyRes.ok) {
      console.error(`Error from stream server: ${proxyRes.status}`);
      return res.status(proxyRes.status).send(proxyRes.statusText);
    }

    res.writeHead(proxyRes.status, Object.fromEntries(proxyRes.headers.entries()));
    proxyRes.body.pipe(res);

  } catch (error) {
    console.error('Error in streaming proxy:', error);
    res.status(500).send('Error connecting to the streaming server.');
  }
}