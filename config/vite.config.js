// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  const inCodespaces = !!process.env.CODESPACES

  return {
    plugins: [react()],

    // ✅ 开发：不加子路径；打包：使用仓库名子路径
    base: isDev ? '/' : '/Student_app/',

    build: {
      sourcemap: false,
    },

    esbuild: {
      drop: ['console', 'debugger'],
    },

    server: {
      host: true,
      port: 5173,
      strictPort: true,

      // ✅ 把 /api 代理到 FastAPI(5051)
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5051',
          changeOrigin: true,
          secure: false,
        },
      },

      // ✅ Codespaces 的 HMR 要走 443 + wss
      hmr: inCodespaces
        ? {
            clientPort: 443,
            protocol: 'wss',
          }
        : {
            // 本地开发默认即可；保留以兼容
            port: 5173,
          },
    },
  }
})
