/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        inspectiq: {
          deepNavy: '#12304A',
          navy: '#0B2239',
          teal: '#0F766E',
          lightTeal: '#E6F4F1',
          amber: '#D97706',
          bg: '#F4F7FA',
          surface: '#FFFFFF',
          text: '#17212B',
          secondary: '#52616F',
          border: '#D9E1E8',
          success: '#15803D',
          warning: '#B45309',
          danger: '#B91C1C',
          info: '#2563EB',
        },
        // Backward-compatible color aliases mapping to InspectIQ palette
        gov: {
          50: '#F4F7FA',
          100: '#E6F4F1',
          200: '#D9E1E8',
          300: '#52616F',
          400: '#0F766E',
          500: '#12304A',
          600: '#0B2239',
          700: '#0B2239',
          800: '#12304A',
          900: '#0B2239',
          950: '#061424',
          gold: '#D97706',
          navy: '#12304A',
          charcoal: '#17212B',
          lightbg: '#F4F7FA',
          cardborder: '#D9E1E8',
        },
        status: {
          pass: '#15803D',
          passBg: '#E6F4F1',
          passBorder: '#A7F3D0',
          review: '#D97706',
          reviewBg: '#FEF3C7',
          reviewBorder: '#FDE68A',
          violation: '#B91C1C',
          violationBg: '#FEE2E2',
          violationBorder: '#FECACA',
        }
      },
      fontFamily: {
        sans: [
          'Roboto',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro',
          'Segoe UI',
          'sans-serif'
        ],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(18, 48, 74, 0.06), 0 1px 2px -1px rgba(18, 48, 74, 0.04)',
        'card-md': '0 4px 6px -1px rgba(18, 48, 74, 0.08), 0 2px 4px -2px rgba(18, 48, 74, 0.04)',
      }
    },
  },
  plugins: [],
}
