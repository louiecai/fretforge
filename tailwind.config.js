/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#181A20',
        panel: '#23272F',
        border: '#3A3A3C',
        accent: '#444447',
        accentlight: '#6B6B6E',
        textprimary: '#FFFFFF',
        textsecondary: '#A1A1AA',
      },
    },
  },
  plugins: [],
}
