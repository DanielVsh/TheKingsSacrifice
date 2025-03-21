/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        urban: {
          white: "#FFFFFF",
          black: "#000000",
          dark: "#2C2C2C",
          light: "#F5F5F5",
          accent: "#FFAB00",
        },
      },},
  },
  plugins: [],
}

