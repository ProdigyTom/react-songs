import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']]
      },
    }),
  ],
  server: {
    port: parseInt(process.env.PORT) || 3002,
    allowedHosts: ['localhost', 'song-project.xyz', 'www.song-project.xyz'],
    proxy: {
      '/api': `http://localhost:${process.env.BACKEND_PORT || 3001}`
    }
  }
})
