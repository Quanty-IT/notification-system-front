/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'jd-green': '#367C2B',
                'jd-green-dark': '#285c20',
                'jd-yellow': '#FFDE00',
            },
        },
    },
    plugins: [],
}