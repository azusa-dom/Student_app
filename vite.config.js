import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 重要：Vercel 部署时使用根路径
  base: '/',
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 优化打包
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  },
  
  server: {
    port: 5173,
    host: true,
    // 如果你有后端 API，配置代理
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  
  preview: {
    port: 4173,
    host: true
  }
})