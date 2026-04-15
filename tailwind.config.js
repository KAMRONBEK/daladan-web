/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '4px',
        md: '4px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        '3xl': '4px',
        full: '9999px',
      },
      colors: {
        daladan: {
          primary: '#2f6d3f',
          accent: '#ffde82',
          accentMuted: '#caa74e',
          accentDark: '#907319',
          soft: '#f0fdf2',
          ink: '#1f2937',
        },
      },
    },
  },
  plugins: [],
}

