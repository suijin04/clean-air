/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        charcoal: {
          800: '#1e293b',
          900: '#0f172a',
        },
        aqi: {
          good: '#10b981',
          moderate: '#f59e0b',
          sensitive: '#f97316',
          unhealthy: '#ef4444',
          veryUnhealthy: '#8b5cf6',
          hazardous: '#7f1d1d',
          unavailable: '#64748b'
        }
      }
    },
  },
  plugins: [],
}
