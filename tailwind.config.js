/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class', // Enables class-based dark mode (toggle with a class)

  theme: {
    extend: {
      fontSize: {
        /** Onboarding hero question — 44px / 50px line (overrides default 3rem). */
        '5xl': ['44px', { lineHeight: '50px' }],
      },
      colors: {
        // ✅ Light Mode Palette (mirrors constants/Colors.ts `light`)
        background: '#ffffff',
        card: '#ffffff',
        primary: '#2563eb',
        secondary: '#1e293b',
        accent: '#facc15',
        textPrimary: '#0f172a',
        textMuted: '#94a3b8',
        success: '#22c55e',
        error: '#ef4444',

        // ✅ Dark Mode Palette (mirrors constants/Colors.ts `dark`)
        'dark-background': '#020617',
        'dark-card': '#111827',
        'dark-primary': '#38bdf8',
        'dark-secondary': '#cbd5e1',
        'dark-accent': '#facc15',
        'dark-textPrimary': '#ffffff',
        'dark-textMuted': '#cbd5e1',
        'dark-success': '#4ade80',
        'dark-error': '#f87171',
      }
    }
  },
  plugins: [],
};