/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdfaf0',
          100: '#faf3d6',
          200: '#f5e6ad',
          300: '#edd47a',
          400: '#e2c660',
          500: '#c9a84c',
          600: '#b08a30',
          700: '#927020',
          800: '#C9A227',
          900: '#B99118',
          950: '#362708',
        },
        gold: {
          300: '#e8cb6a',
          400: '#ddb945',
          500: '#c9a84c',
          600: '#b08a30',
          700: '#927020',
        },
        dark: {
          700: '#272720',
          800: '#1a1916',
          900: '#0d0d0b',
        },
        cream: {
          50:  '#fdfbf5',
          100: '#faf3e0',
          200: '#f5e9c8',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Poppins"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
