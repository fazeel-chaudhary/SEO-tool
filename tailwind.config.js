/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5ed',
          100: '#ffe6d4',
          200: '#ffd0b3',
          300: '#ffa570',
          400: '#ff7833',
          500: '#F66A0A',
          600: '#e05500',
          700: '#b83d00',
          800: '#913000',
          900: '#752800',
          950: '#401200',
        },
        cream: '#FEF0C7',
        greenAccent: '#DCFFE4',
      },
      fontFamily: {
        sans: ['Gilroy', 'League Spartan', 'Poppins', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
