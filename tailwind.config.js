/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-green': '#1a4d2e', // Deep forest green
                'brand-cream': '#fdfbf7', // Warm cream background
                'primary': '#4caf50',     // Standard green for buttons/accents
                'deep-green': '#0f2f1c',  // Darker text color
                'background-dark': '#121212', // Dark mode background
            },
            fontFamily: {
                'display': ['Inter', 'sans-serif'], // Or whatever font you want to use
                'sans': ['Inter', 'sans-serif'],
            },
        },
    },
    darkMode: 'class',
    plugins: [],
}
