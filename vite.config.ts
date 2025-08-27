import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
