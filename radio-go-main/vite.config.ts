import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false,
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false,
    })
  ],
  server: {
    proxy: {
      '/api/stream': {
        target: 'https://cast4.prosandoval.com/listen/radio_go/radio.mp3',
        changeOrigin: true,
        rewrite: () => '',
        secure: true,
        followRedirects: true
      }
    }
  }
})
