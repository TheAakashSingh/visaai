/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0b0f',
        bg2: '#0f1117',
        bg3: '#151820',
        border: 'rgba(255,255,255,0.07)',
        'red-brand': '#e8372a',
        'red-light': '#ff5a4e',
        gold: '#f5c842',
        success: '#34d399',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'pulse-dot': 'pulseDot 2s infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.5, transform: 'scale(1.3)' } },
        wave: { '0%,100%': { height: '4px' }, '50%': { height: '32px' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
