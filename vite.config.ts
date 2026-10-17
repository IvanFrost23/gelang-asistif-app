import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: { output: { manualChunks: { tf: ['@tensorflow/tfjs'], firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'] } } },
  },
})
