import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FBF8F5',
        surface: '#FFFFFF',
        ink: '#1A1614',
        muted: '#7A7068',
        hairline: '#E8E2D9',
        accent: '#C9513A',
        highlight: '#FFF4F2',
        // backward compat aliases
        cream: '#FBF8F5',
        background: '#FBF8F5',
        gold: '#C9513A',
        black: '#1A1614',
        charcoal: '#7A7068',
        text: '#1A1614',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px rgba(26, 22, 20, 0.08)',
        card: '0 2px 12px rgba(26, 22, 20, 0.07)',
      },
      transitionTimingFunction: {
        'soft-ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        fadeUp: 'fadeUp 0.9s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
