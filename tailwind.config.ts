import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Poppins',
          'system-ui',
          '-apple-system',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        serif: [
          'Cormorant Garamond',
          'Merriweather',
          'Georgia',
          'serif',
        ],
      },
      colors: {
        // ── Legacy tokens (used by calculator page) ──────────────────
        forest: '#162716',   // deep dark green bg
        mist:   '#E8F0E8',   // light text on dark bg
        glow:   '#9CAF88',   // sage green accent

        eco: {
          // Primary greens
          emerald:    '#2C5F2D',
          olive:      '#6B8E23',
          // Secondary earth tones
          brown:      '#8B5A2B',
          cream:      '#F5F5DC',
          // Accents
          sage:       '#9CAF88',
          terra:      '#E07A5F',
          // Backgrounds
          offwhite:   '#FAF9F6',
          white:      '#FFFFFF',
          // Text
          forest:     '#1A3B1A',
          beige:      '#F0EAD6',
          // Dark mode surfaces
          'dark-bg':      '#0F1F0F',
          'dark-surface': '#162716',
          'dark-card':    '#1E331E',
          'dark-text':    '#E8F0E8',
          'dark-muted':   '#A8BEA8',
          'dark-border':  '#2E4E2E',
        },
      },
      boxShadow: {
        eco: '0 2px 12px rgba(44, 95, 45, 0.06)',
        'eco-md': '0 4px 24px rgba(44, 95, 45, 0.10)',
        'eco-lg': '0 8px 40px rgba(44, 95, 45, 0.14)',
        'eco-terra': '0 4px 20px rgba(224, 122, 95, 0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
