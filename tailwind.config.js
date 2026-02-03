import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAFAF8',
          100: '#F5F5F0',
          200: '#EAEAE5',
          300: '#DDDDD8',
        },
        accent: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          light: '#CCFBF1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
        dropdown: '0 4px 16px rgba(0, 0, 0, 0.12)',
        panel: '-4px 0 16px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      transitionProperty: {
        width: 'width',
        spacing: 'margin, padding',
      },
    },
  },
  plugins: [typography, daisyui],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#0D9488',
          'primary-focus': '#0F766E',
          'primary-content': '#FFFFFF',
          secondary: '#6B6B6B',
          accent: '#0D9488',
          neutral: '#1A1A1A',
          'base-100': '#FFFFFF',
          'base-200': '#F5F5F0',
          'base-300': '#EAEAE5',
          info: '#3B82F6',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          'error-content': '#FFFFFF',
        },
      },
      {
        dark: {
          primary: '#14B8A6',
          'primary-focus': '#2DD4BF',
          'primary-content': '#FFFFFF',
          secondary: '#9CA3AF',
          accent: '#14B8A6',
          neutral: '#F5F5F0',
          'base-100': '#1F2937',
          'base-200': '#111827',
          'base-300': '#0F172A',
          info: '#60A5FA',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
          'error-content': '#FFFFFF',
        },
      },
    ],
  },
};
