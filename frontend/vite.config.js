import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      host: "localhost",
      protocol: "ws",
    },
  },
  optimizeDeps: {
    exclude: ['chunk-GYYMRS4U', 'chunk-TRC6RKZS', 'chunk-HT2KZPFB', 'chunk-WNLYUZ4B', 'chunk-IUXMCLSG', 'chunk-WNLYUZ4B', 'chunk-IUXMCLSG' ],
  },
})
