export default async function handler(req, res) {
  try {
    const streamUrl = 'https://cast4.prosandoval.com/public/radio_go';
    
    // Fetch del stream original
    const response = await fetch(streamUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Configurar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Copiar headers del stream original
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Si es OPTIONS (preflight), responder inmediatamente
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Pipe del stream
    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    
    res.end();
  } catch (error) {
    console.error('Error proxying stream:', error);
    res.status(500).json({ error: 'Error accessing stream' });
  }
}
