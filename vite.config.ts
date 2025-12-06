import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy removido: Usamos URLs directas que soportan CORS o no lo requieren (audio)
  }
})
