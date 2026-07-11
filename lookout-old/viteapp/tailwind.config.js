/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFC300',
          dark: '#CC9F00',
        },
        gold: {
          DEFAULT: '#FFD700',
          hover: '#FFC107',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '400' }],
        sm: ['0.875rem', { lineHeight: '1.25', letterSpacing: '0.02em', fontWeight: '400' }],
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }],
        lg: ['1.125rem', { lineHeight: '1.75', letterSpacing: '0.01em', fontWeight: '400' }],
        xl: ['1.25rem', { lineHeight: '1.75', letterSpacing: '0em', fontWeight: '500' }],
        '2xl': ['1.5rem', { lineHeight: '2', letterSpacing: '0em', fontWeight: '500' }],
        '3xl': ['1.875rem', { lineHeight: '2.25', letterSpacing: '0em', fontWeight: '600' }],
        '4xl': ['2.25rem', { lineHeight: '2.5', letterSpacing: '-0.01em', fontWeight: '700' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '700' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '800' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '800' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '900' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '900' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}