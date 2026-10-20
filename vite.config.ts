import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html'), gelang: resolve(__dirname, 'gelang/index.html') },
      output: {
        // Общий хелпер CommonJS держим рядом с React, иначе промо-страница тянет чанк TensorFlow
        manualChunks(id) {
          if (id.includes('commonjsHelpers') || /node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          if (id.includes('@tensorflow')) return 'tf'
          if (/node_modules\/(firebase|@firebase)\//.test(id)) return 'firebase'
          if (id.includes('node_modules/three/')) return 'three'
        },
      },
    },
  },
})
