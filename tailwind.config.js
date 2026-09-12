/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        moss: '#335C40',
        'moss-light': '#4F8F63',
        kraft: '#C98A3B',
        steel: '#6B7A8F',
        sky: '#4F8FBF',
        danger: '#C4553D',
        appbg: '#EFF3EE',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
