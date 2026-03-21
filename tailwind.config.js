/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Crimson Pro"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        gold: {
          50: '#fdf8e8',
          100: '#f9edc4',
          200: '#f0d88a',
          300: '#e4be4a',
          400: '#d4a420',
          500: '#b8860b',
          600: '#9a6f09',
          700: '#7c590a',
          800: '#674a10',
          900: '#583e13',
        },
        parchment: {
          50: '#faf9f6',
          100: '#f7f5f0',
          200: '#edeae3',
          300: '#e0ddd5',
          400: '#c5c1b7',
          500: '#a9a599',
          600: '#8a867b',
          700: '#6e6b63',
          800: '#5a5852',
          900: '#4c4a45',
        },
        ink: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#3a3a3a',
          700: '#2a2a2a',
          800: '#1a1a1a',
          900: '#0f0f0f',
        },
      },
    },
  },
  plugins: [],
};
