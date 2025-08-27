import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Student_app/',  // 项目在 GitHub Pages 的子路径下，资源应以仓库名为前缀
})
