/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#0b2e24",
          900: "#0d3b2e",
          800: "#13503d",
          700: "#1a6b52",
          600: "#1f8065",
        },
      },
    },
  },
  plugins: [],
};
