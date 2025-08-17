export default async function handler(req, res) {
  // Configurar headers CORS para todas las requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  
  // Si es OPTIONS (preflight), responder inmediatamente
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const streamUrl = 'https://cast4.prosandoval.com/public/radio_go';
    
    console.log('Proxying stream from:', streamUrl);
    
    // Fetch del stream original con headers apropiados para streaming
    const response = await fetch(streamUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Radio-Go-Player/1.0',
        'Accept': 'audio/*',
        'Range': req.headers.range || 'bytes=0-',
      },
    });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Configurar headers de respuesta para streaming
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Copiar otros headers importantes si existen
    if (response.headers.get('Content-Length')) {
      res.setHeader('Content-Length', response.headers.get('Content-Length'));
    }
    if (response.headers.get('Accept-Ranges')) {
      res.setHeader('Accept-Ranges', response.headers.get('Accept-Ranges'));
    }
    
    // Para Node.js en Vercel, usar response.body directamente
    if (response.body) {
      const reader = response.body.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          if (!res.destroyed) {
            res.write(Buffer.from(value));
          } else {
            break;
          }
        }
      } catch (streamError) {
        console.error('Error during streaming:', streamError);
      } finally {
        reader.releaseLock();
      }
    }
    
    res.end();
    
  } catch (error) {
    console.error('Error proxying stream:', error);
    res.status(500).json({ 
      error: 'Error accessing stream',
      details: error.message 
    });
  }
}
