import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
  },
  preview: {
    port: 3001,
    strictPort: true,
  },
  define: {
    'process.env': {},
    'process.version': {}
  },
  optimizeDeps: {
    include: ['react-pdf']
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',  // Changed from 'terser' to 'esbuild'
    sourcemap: false,
  }
})