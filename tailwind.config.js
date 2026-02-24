/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fredoka One"', 'cursive'],
      },
      boxShadow: {
        'widget': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'widget-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'widget-lg': '0 20px 60px rgba(0, 0, 0, 0.1)',
        'soft': '0 2px 15px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'strong': '0 8px 30px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'widget': '1rem',
        'card': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      }
    },
  },
  plugins: [],
}
