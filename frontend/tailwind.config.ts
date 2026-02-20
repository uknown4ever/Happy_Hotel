import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#080f1e',
          900: '#0f1929',
          800: '#111d30',
          700: '#162238',
          600: '#1e3050',
        },
        gold: {
          dim: '#8a6425',
          DEFAULT: '#c9973a',
          light: '#e2b96a',
          bright: '#f5d08a',
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'shimmer': 'shimmer 3s linear infinite',
        'pulse-gold': 'pulse-gold 2s ease infinite',
        'skeleton': 'skeletonPulse 1.5s ease infinite',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #8a6425, #c9973a, #e2b96a)',
        'card-gradient': 'linear-gradient(135deg, #111d30, #162238)',
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(201, 151, 58, 0.3)',
        'gold-lg': '0 8px 40px rgba(201, 151, 58, 0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}

export default config