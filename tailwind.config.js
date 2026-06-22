/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#002045', light: '#1a365d', dark: '#001530' },
        secondary: { DEFAULT: '#1960a3', light: '#7db6ff', dark: '#0d4a82' },
        success: { DEFAULT: '#1a6b2a', light: '#c8f5d2' },
        warning: { DEFAULT: '#856404', light: '#fff3cd' },
        danger: { DEFAULT: '#ba1a1a', light: '#ffdad6' },
        gold: { DEFAULT: '#b8860b', light: '#fff8e1' },
        surface: {
          DEFAULT: '#f7fafc', low: '#f1f4f6', container: '#ebeef0',
          high: '#e5e9eb', highest: '#e0e3e5',
        },
      },
      fontFamily: { sans: ['Inter', 'Noto Sans Thai', 'system-ui', 'sans-serif'] },
      borderRadius: { xl: '12px', '2xl': '16px' },
      boxShadow: {
        card: '0 2px 8px rgba(0,32,69,0.08)',
        'card-hover': '0 8px 24px rgba(0,32,69,0.14)',
        modal: '0 20px 60px rgba(0,32,69,0.2)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
