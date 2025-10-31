import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // ✅ Vercel 使用根路径
  build: {
    sourcemap: false,
    // ✅ 修复 fsevents 构建错误
    rollupOptions: {
      external: ['fsevents'],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    // 添加 commonjsOptions 来处理 Node 模块
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  // 开发服务器配置
  server: {
    port: 5173,
    host: true,
    hmr: {
      port: 5173
    }
  },
  // ✅ 优化依赖处理
  optimizeDeps: {
    exclude: ['fsevents']
  }
})