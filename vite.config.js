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
    port: 3002,
    allowedHosts: ['localhost', 'song-project.xyz', 'www.song-project.xyz'],
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
