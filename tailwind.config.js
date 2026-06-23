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
        // ── Stitch design system tokens ──────────────────────
        'on-surface': '#181c1e',
        'on-surface-variant': '#43474e',
        outline: '#74777f',
        'outline-variant': '#c4c6cf',
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'fit-confirmed': { DEFAULT: '#15803d', bg: '#F0FFF4' },
      },
      fontFamily: { sans: ['Inter', 'Noto Sans Thai', 'system-ui', 'sans-serif'] },
      borderRadius: { xl: '12px', '2xl': '16px' },
      boxShadow: {
        card: '0 2px 8px rgba(0,32,69,0.08)',
        'card-hover': '0 8px 24px rgba(0,32,69,0.14)',
        modal: '0 20px 60px rgba(0,32,69,0.2)',
        // ── Stitch ambient shadow (navy-tinted, per DESIGN.md) ──
        product: '0 4px 12px rgba(26,54,93,0.05)',
        'product-hover': '0 8px 20px rgba(26,54,93,0.1)',
      },
      fontSize: {
        // ── Stitch type scale (kept alongside Tailwind defaults) ──
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.01em', fontWeight: '600' }],
      },
      spacing: {
        // ── Stitch spacing scale ──
        'stack-xs': '0.25rem',
        'stack-sm': '0.5rem',
        'stack-md': '1rem',
        'stack-lg': '2rem',
        gutter: '1.5rem',
        'margin-mobile': '1rem',
      },
      maxWidth: {
        'container-max': '1280px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
