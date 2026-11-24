/** @type {import('tailwindcss').Config} */
const brandViolet = {
  50: '#f8f5ff',
  100: '#f0ebff',
  200: '#e0d6ff',
  300: '#cdbfff',
  400: '#a48fff',
  500: '#8466ff',
  600: '#6a4be8',
  700: '#5634d6',
  800: '#4528c4',
  900: '#3d2398',
  950: '#2c1a6e',
};

module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: brandViolet,
        violet: brandViolet,
        purple: brandViolet,
      },
    },
  },
  plugins: [],
};
