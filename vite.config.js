import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Student_app/',  // 添加这行，确保在 GitHub Pages 上资源路径正确
})
