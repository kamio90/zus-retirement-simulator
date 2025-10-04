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
        },
      },
      fontFamily: {
        sans: ['Lato', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
