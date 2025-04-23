/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: {
          400: 'rgb(56, 189, 248)',
          500: 'rgb(14, 165, 233)',
          600: 'rgb(2, 132, 199)',
        },
        secondary: {
          500: 'rgb(217, 70, 239)',
          600: 'rgb(192, 38, 211)',
        },
      },
    },
  },
  plugins: [],
} 