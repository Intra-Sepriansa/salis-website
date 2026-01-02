import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--primary)',
          fg: 'var(--primary-foreground)',
          accent: 'var(--accent)'
        },
        bg: 'var(--bg)',
        muted: 'var(--muted)',
      },
      borderRadius: {
        'xl2': '1.25rem'
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(0,0,0,0.15)'
      }
    }
  },
  plugins: [],
} satisfies Config
