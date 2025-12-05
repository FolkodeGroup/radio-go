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
        target: 'https://server.streamcasthd.com/8056/stream',
        changeOrigin: true,
        rewrite: () => '',
        secure: false, // Set to false to avoid SSL issues if certificate chain is incomplete, though URL is https
        followRedirects: true
      }
    }
  }
})
