/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Accent — persimmon. Deepened from #f97316 so white text on it passes AA.
                'primary': '#e2620d',
                'primary-hover': '#c25009',
                'primary-soft': '#fff2e7',
                'primary-tint': '#fadfc7',

                // Structure — forest. Grounds the inverted bands and all headings.
                'brand-green': '#06332b',
                'brand-emerald': '#0e7c5f',
                'brand-moss': '#0a5a46',
                'brand-mint': '#e9f3ef',

                // Paper
                'brand-cream': '#fbf8f3',
                'brand-cream-soft': '#f4ede2',
                'brand-line': '#e8dfd0',

                // Text
                'ink': '#16241f',
                'ink-soft': '#5b6a64',
                'ink-faint': '#8a958f',

                // Warm dark theme (landing page)
                'night': '#0a1512',
                'night-soft': '#10201b',
                'night-card': '#152a22',
                'night-line': '#24392f',

                // Retained for dashboard screens not covered by this redesign
                'slate-charcoal': '#0f172a',
                'slate-dark-card': '#1e293b',
                'deep-green': '#052620',
                'background-dark': '#0a1512',
            },
            fontFamily: {
                'display': ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
                'sans': ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
                'mono': ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
            },
            letterSpacing: {
                'tightest': '-0.045em',
            },
            boxShadow: {
                'warm': '0 10px 25px -5px rgba(226, 98, 13, 0.08), 0 8px 10px -6px rgba(6, 51, 43, 0.05)',
                'warm-lg': '0 20px 35px -10px rgba(226, 98, 13, 0.12), 0 10px 15px -3px rgba(6, 51, 43, 0.08)',
                'glass': '0 8px 32px 0 rgba(6, 51, 43, 0.08)',
                'lift': '0 22px 45px -28px rgba(6, 51, 43, 0.55)',
                'lift-lg': '0 34px 70px -34px rgba(6, 51, 43, 0.6)',
            },
            keyframes: {
                'rise': {
                    from: { opacity: '0', transform: 'translateY(14px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'ticker': {
                    from: { opacity: '0', transform: 'translateY(6px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'rise': 'rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
                'ticker': 'ticker 0.45s ease-out both',
            },
        },
    },
    darkMode: 'class',
    plugins: [],
}
