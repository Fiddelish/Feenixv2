/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flowbite-react/**/*.js",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tw-elements/dist/js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif']
      },
      padding: {
        '1/2': '50%',
        full: '100%',
      },
      gridTemplateColumns: {
        // Simple 16 column grid
        '25': 'repeat(25, minmax(0, 1fr))',
      }
    },
  },
  plugins: [
    require("tw-elements/dist/plugin"),
    require("flowbite/plugin"),
  ],
}
