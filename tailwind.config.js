/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Superficie del taller: tinta fria, nunca negro puro.
        ink: {
          950: '#080D17',
          900: '#0C1220',
          800: '#121A2B',
          700: '#1A2436',
          600: '#232F45',
        },
        edge: '#263149',
        chalk: '#E8ECF5',
        muted: '#8794AE',
        // Acento calido: el sobre de manila sobre la mesa de dibujo.
        saffron: {
          DEFAULT: '#E8A33D',
          soft: '#F0BE73',
          deep: '#C4842A',
        },
        signal: '#4C8DFF',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'sans-serif'],
        sans: ['"Public Sans"', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        paper: '0 40px 80px -24px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.06)',
        lift: '0 8px 24px -8px rgba(0,0,0,.6)',
      },
      transitionTimingFunction: {
        snap: 'cubic-bezier(.2,.8,.2,1)',
      },
    },
  },
  plugins: [],
}
