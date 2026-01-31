/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FDE047',
          50: '#FFFEF0',
          100: '#FFFDE1',
          200: '#FFFAC3',
          300: '#FEF5A5',
          400: '#FEEE87',
          500: '#FDE047',
          600: '#FACC15',
          700: '#CA8A04',
          800: '#A16207',
          900: '#854D0E',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626',
        },
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
          dark: '#16A34A',
        },
      },
      boxShadow: {
        large: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [require("daisyui")],
}
