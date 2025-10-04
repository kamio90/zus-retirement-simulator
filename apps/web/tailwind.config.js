/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        zus: {
          primary: '#007a33',    // ZUS primary green
          secondary: '#e5f3e8',  // ZUS secondary light green
          accent: '#004c1d',     // ZUS accent dark green
          error: '#b00020',      // ZUS error red
          text: '#0b1f17',       // ZUS text dark green
          border: '#d8e5dd',     // ZUS border light gray-green
        },
      },
      fontFamily: {
        sans: ['Lato', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
