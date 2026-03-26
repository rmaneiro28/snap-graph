/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: '#00f2fe',
          secondary: '#4facfe',
        },
        dark: {
          card: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
      }
    },
  },
  plugins: [],
}
