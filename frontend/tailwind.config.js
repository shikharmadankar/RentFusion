/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B2B22',
          light: '#324A34',
          900: '#14201A',
          800: '#1B2B22',
          700: '#243528',
          600: '#324A34',
        },
        paper: {
          DEFAULT: '#F3EFE4',
          dim: '#EAE4D4',
        },
        amber: {
          DEFAULT: '#D98E2A',
          dark: '#B5732A',
        },
        clay: {
          DEFAULT: '#B5432E',
        },
        moss: {
          DEFAULT: '#7C9473',
        },
        charcoal: '#24261F',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        tag: '10px',
      },
      boxShadow: {
        tag: '0 6px 20px -6px rgba(27, 43, 34, 0.35)',
        card: '0 10px 30px -12px rgba(27, 43, 34, 0.25)',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        swing: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        ticker: 'ticker 28s linear infinite',
        swing: 'swing 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
