/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
