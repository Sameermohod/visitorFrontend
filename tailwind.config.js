/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080C14',
          card: '#0F172A',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
          glow: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
