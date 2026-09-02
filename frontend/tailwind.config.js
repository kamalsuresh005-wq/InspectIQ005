/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#faf5f0',
          100: '#f4e8dc',
          200: '#ebd3be',
          300: '#deb696',
          400: '#ce926a',
          500: '#b86b35',
          600: '#a35528',
          700: '#874121',
          800: '#6f361f',
          900: '#5c2f1d',
          950: '#34170d',
          gold: '#c29438',
          navy: '#1e3a8a',
          charcoal: '#1e293b',
          lightbg: '#f8fafc',
          cardborder: '#e2e8f0',
        },
        status: {
          pass: '#16a34a',
          passBg: '#f0fdf4',
          passBorder: '#bbf7d0',
          review: '#d97706',
          reviewBg: '#fffbeb',
          reviewBorder: '#fde68a',
          violation: '#dc2626',
          violationBg: '#fef2f2',
          violationBorder: '#fecaca',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Segoe UI', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gov': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.07)',
        'gov-md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'gov-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
