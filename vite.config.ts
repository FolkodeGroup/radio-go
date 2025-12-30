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
      '/api/metadata': {
        target: 'https://server.streamcasthd.com/cp/get_info.php?p=8056',
        changeOrigin: true,
        rewrite: () => '',
        secure: false
      }
    }
  }
})
