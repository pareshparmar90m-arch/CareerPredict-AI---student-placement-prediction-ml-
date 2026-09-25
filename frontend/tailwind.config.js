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
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        navy: {
          DEFAULT: '#0F172A',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        accent: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
        },
        slateBg: '#F8FAFC',
        cardBg: '#FFFFFF',
        borderColor: '#E2E8F0',
        textMain: '#0F172A',
        textMuted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
