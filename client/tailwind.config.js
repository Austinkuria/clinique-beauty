/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out'
      },
      fontFamily: {
        sans: ['Poppins', 'Roboto', 'sans-serif'],
      },
      gradientColorStops: theme => ({
        ...theme('colors')
      }),
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, #f8e8ff 0%, #ffffff 100%)',
        'gradient-dark': 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
      }
    }
  },
  plugins: [],
  mode: 'jit',
  variants: {
    extend: {
      backgroundColor: ['hover', 'focus'],
      textColor: ['hover', 'focus'],
      borderColor: ['hover', 'focus'],
    }
  }
};
