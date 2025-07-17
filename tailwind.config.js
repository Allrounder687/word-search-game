/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'quicksand': ['Quicksand', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'word-found': 'word-found 0.6s ease-out',
        'rainbow': 'rainbow-shift 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-in': 'bounce-in 0.6s ease-out forwards',
        'sparkle': 'sparkle 1s ease-in-out infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'word-trail': 'word-trail 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 5px rgba(255, 255, 255, 0.3)',
          },
          '50%': {
            'box-shadow': '0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)',
          },
        },
        'word-found': {
          '0%': {
            transform: 'scale(1) rotate(0deg)',
            'box-shadow': '0 0 0px transparent',
          },
          '25%': {
            transform: 'scale(1.15) rotate(2deg)',
            'box-shadow': '0 0 15px currentColor',
          },
          '50%': {
            transform: 'scale(1.2) rotate(-2deg)',
            'box-shadow': '0 0 25px currentColor, 0 0 35px currentColor',
          },
          '75%': {
            transform: 'scale(1.1) rotate(1deg)',
            'box-shadow': '0 0 15px currentColor',
          },
          '100%': {
            transform: 'scale(1) rotate(0deg)',
            'box-shadow': '0 0 5px currentColor',
          },
        },
        'rainbow-shift': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'sparkle': {
          '0%, 100%': {
            opacity: '0',
            transform: 'scale(0) rotate(0deg)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1) rotate(180deg)',
          },
        },
        'slide-in': {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'bounce-in': {
          '0%': {
            transform: 'scale(0.3)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.05)',
          },
          '70%': {
            transform: 'scale(0.9)',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 5px currentColor)',
          },
          '50%': {
            filter: 'drop-shadow(0 0 20px currentColor) drop-shadow(0 0 30px currentColor)',
          },
        },
        'word-trail': {
          '0%': {
            'background-position': '-200% 50%',
            opacity: '0.8',
          },
          '100%': {
            'background-position': '300% 50%',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}