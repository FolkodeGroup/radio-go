// /api/stream.mjs

export const config = {
  runtime: 'edge', // Usamos el runtime de Vercel Edge para mejor rendimiento de streaming
};

export default async function handler(request) {
  // URL del servidor de streaming real.
  // El "/" al final es importante para Icecast.
  const STREAM_URL = 'http://138.199.234.123:8020/stream';

  try {
    // Hacemos la petición desde el servidor de Vercel al servidor de streaming.
    const response = await fetch(STREAM_URL);

    // Si el servidor de streaming no responde correctamente, devolvemos un error.
    if (!response.ok) {
      return new Response('El servidor de streaming no está disponible.', { status: 502 });
    }

    // Clonamos las cabeceras (headers) de la respuesta original.
    const headers = new Headers(response.headers);
    
    // Establecemos cabeceras para asegurar que el navegador lo trate como un stream en vivo.
    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Cache-Control', 'no-cache, no-store');
    headers.set('Pragma', 'no-cache');
    headers.set('Connection', 'keep-alive');
    headers.set('Accept-Ranges', 'none');

    // Creamos una nueva respuesta con el cuerpo del stream (response.body)
    // y las cabeceras que hemos preparado.
    return new Response(response.body, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('Error en el proxy de streaming:', error);
    return new Response('Error al conectar con el servidor de streaming.', { status: 500 });
  }
}