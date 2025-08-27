import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // 使用根路径，避免在 GitHub Pages 部署时产生重复的子路径
})
