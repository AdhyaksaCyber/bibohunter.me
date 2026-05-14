import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#fdf8f0',
        cream2: '#f5efe2',
        gold: '#b8711e',
        'gold-light': '#d4893a',
        'gold-pale': '#fef3e2',
        navy: '#0d1b35',
        navy2: '#162040',
        ink: '#1a1a2e',
        muted: '#6b7a99',
        muted2: '#8a96b0',
        border: '#e8dcc8',
        border2: '#d4c5a9',
        green: {
          DEFAULT: '#15803d',
          bg: '#f0fdf4',
        },
        dark: {
          bg: '#0a1628',
          bg2: '#0f1e3c',
          surface: '#162240',
          text: '#f0f4ff',
        },
      },
      fontFamily: {
        'bebas': ['"Bebas Neue"', ...defaultTheme.fontFamily.sans],
        'nunito': ['"Nunito"', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        'gold': '0 5px 22px rgba(184, 113, 30, 0.38)',
        'gold-lg': '0 10px 30px rgba(184, 113, 30, 0.52)',
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '24px',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { boxShadow: '0 6px 24px rgba(37, 211, 102, 0.4)' },
          '50%': { boxShadow: '0 6px 42px rgba(37, 211, 102, 0.7)' },
        },
      },
    },
  },
  plugins: [],
};
