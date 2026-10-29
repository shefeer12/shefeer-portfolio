import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#070709',
        panel: '#0e0e13',
        card: '#14141c',
        borderline: 'rgba(255, 255, 255, 0.08)',
        accent: {
          DEFAULT: '#ff5500',
          hover: '#ff6e26',
          subtle: 'rgba(255, 85, 0, 0.12)'
        },
        muted: '#8f8b86',
        subtle: '#383535',
        canvas: '#f4f2ee'
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      letterSpacing: {
        tighter: '-0.06em',
        tight: '-0.035em',
        widest: '0.22em'
      },
      keyframes: {
        'equalizer-bar': {
          '0%, 100%': { height: '20%' },
          '50%': { height: '100%' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' }
        }
      },
      animation: {
        'equalizer-1': 'equalizer-bar 0.8s ease-in-out infinite alternate',
        'equalizer-2': 'equalizer-bar 0.6s ease-in-out infinite 0.2s alternate',
        'equalizer-3': 'equalizer-bar 0.9s ease-in-out infinite 0.4s alternate',
        'equalizer-4': 'equalizer-bar 0.7s ease-in-out infinite 0.1s alternate',
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: []
};

export default config;
