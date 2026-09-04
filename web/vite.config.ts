import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    // examsData.ts is auto-generated and intentionally large (exam question bank)
    chunkSizeWarningLimit: 2500,
  },
})
