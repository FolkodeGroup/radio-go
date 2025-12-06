// /api/metadata.js
import fetch from 'node-fetch';

const METADATA_URL = 'https://server.streamcasthd.com/cp/get_info.php?p=8056';

export default async function handler(req, res) {
  // Configurar cabeceras para CORS y JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  // Cache por 2 segundos para no saturar la API
  res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate');

  try {
    const proxyRes = await fetch(METADATA_URL);

    if (!proxyRes.ok) {
      // Si el servidor de streaming falla, devolvemos un error
      console.error(`Error from metadata server: ${proxyRes.status}`);
      res.status(proxyRes.status).json({ error: 'Metadata server error' });
      return;
    }

    const data = await proxyRes.json();
    
    // Devolvemos los datos JSON al cliente
    res.status(200).json(data);

  } catch (error) {
    console.error('Error in metadata proxy:', error);
    res.status(500).json({ error: 'Could not fetch metadata.' });
  }
}
