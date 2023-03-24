/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
            },
            padding: {
                "1/2": "50%",
                full: "100%",
            },
            gridTemplateColumns: {
                // Simple 16 column grid
                25: "repeat(25, minmax(0, 1fr))",
            },
        },
    },
    plugins: [],
};
