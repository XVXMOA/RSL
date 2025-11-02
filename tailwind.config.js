/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3f8cff',
          dark: '#1e3a8a'
        },
        accent: '#fbbf24'
      }
    }
  },
  plugins: []
};
