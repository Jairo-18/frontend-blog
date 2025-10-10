/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      screens: {
        '3xl': '1792px',
      },
      backgroundImage: {
        homeCard: 'linear-gradient(to bottom right, #4A336B 0%, #692E93 100%)',
      },
    },
  },
  plugins: [],
};
