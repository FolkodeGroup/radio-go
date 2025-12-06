# Radio Go - Modern Web Player

Radio Go es una aplicación web moderna construida con React, TypeScript y Vite para la reproducción de streaming de radio en línea, con visualización de metadatos en tiempo real.

## 🚀 Características

*   Reproducción de audio en streaming (Live Radio).
*   Visualización de metadatos "Now Playing" (Título y Artista) en tiempo real.
*   Diseño moderno y responsivo con animaciones (Framer Motion).
*   Indicadores visuales de estado (Cargando, En Vivo, Error).

## 🛠️ Tecnologías

*   **Frontend Framework**: React
*   **Lenguaje**: TypeScript
*   **Build Tool**: Vite
*   **Estilos**: Tailwind CSS
*   **Animaciones**: Framer Motion
*   **Iconos**: Lucide React

## ⚙️ Configuración del Streaming

El proyecto está configurado para consumir un stream de audio SSL y una API de metadatos directamente evitando proxys para facilitar el despliegue en Vercel/Netlify.

### URLs Configuradas

*   **Stream de Audio**: `https://server.streamcasthd.com/8056/stream`
*   **Metadatos**: `https://server.streamcasthd.com/cp/get_info.php?p=8056`

## 📦 Instalación y Ejecución

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/FolkodeGroup/radio-go.git
    cd radio-go
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

4.  **Construir para producción**:
    ```bash
    npm run build
    ```

## 🔧 Variables de Entorno

El archivo `.env` controla la configuración del player.

```env
# URL directa del stream (SSL)
VITE_STREAM_URL=https://server.streamcasthd.com/8056/stream

# Configuración de Supabase (si aplica)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
