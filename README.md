# Demo Radio Go

Demo Radio Go es una landing page SPA para una radio online, diseñada con tecnologías modernas como React, TypeScript, TailwindCSS y Framer Motion. Este proyecto incluye un reproductor de audio futurista y personalizable, listo para recibir la URL del streaming como variable de entorno.

## Tecnologías Utilizadas

- **React**: Para la construcción de la interfaz de usuario.
- **TypeScript**: Para garantizar la seguridad de tipos en el desarrollo.
- **TailwindCSS**: Para estilos rápidos y personalizados.
- **Framer Motion**: Para animaciones fluidas y modernas.
- **Vite**: Para un entorno de desarrollo rápido y eficiente.

## Características

- **Reproductor de Audio Moderno**: Con controles de reproducción, volumen y visualización de ecualizador animado.
- **Diseño Responsivo**: Adaptado para dispositivos móviles y de escritorio.
- **Integración de Streaming**: Configurable mediante la variable de entorno `VITE_STREAM_URL`.
- **Estilo Futurista**: Uso de gradientes, sombras y animaciones para una experiencia visual única.

## Configuración del Proyecto

1. Clona este repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura la URL del streaming en un archivo `.env`:
   ```env
   VITE_STREAM_URL=https://tu-url-de-streaming.com
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre el proyecto en tu navegador en `http://localhost:3000`.

## Despliegue

Este proyecto está optimizado para ser desplegado en [Vercel](https://vercel.com/):

1. Conecta tu repositorio a Vercel.
2. Configura la variable de entorno `VITE_STREAM_URL` en el panel de configuración de Vercel.
3. Despliega automáticamente al hacer push a la rama principal.

## Capturas de Pantalla

*(Incluye capturas de pantalla del diseño y el reproductor aquí)*

## Contribuciones

¡Las contribuciones son bienvenidas! Si deseas colaborar, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

Desarrollado con ❤️ por FolKode Group.
