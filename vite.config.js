import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Student_app/',  // 项目在 GitHub Pages 的子路径下，资源应以仓库名为前缀
  build: {
    sourcemap: false,  // 禁用sourcemap避免CSP问题
    // 使用默认的esbuild压缩，更快且兼容性更好
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  // 开发服务器配置
  server: {
    port: 5173,
    host: true,
    // 添加CSP兼容的开发配置
    hmr: {
      port: 5173
    }
  }
})
