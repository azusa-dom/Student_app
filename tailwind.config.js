/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // 动态颜色类（CampusPage 图标背景/前景）
    {
      pattern: /(bg|text)-(blue|green|purple|orange|pink)-(50|100|200|300|400|500)\/?(10|20|30|40|50)?/,
    },
    // 动态透明/模糊强度（ThemeContext 生成）
    { pattern: /bg-white\/(\d{1,2}|100)/ },
    { pattern: /backdrop-blur-(\d)xl/ },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#93c5fd', // Light blue
          DEFAULT: '#3b82f6', // Blue
          dark: '#1e40af', // Dark blue
        },
        secondary: {
          light: '#fbcfe8', // Light pink
          DEFAULT: '#ec4899', // Pink
          dark: '#9d174d', // Dark pink
        },
      },
    },
  },
  plugins: [],
}
