
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./types.ts",
    "./constants.ts",
    "./components/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#1e293b',
          950: '#020617',
        }
      },
      backgroundImage: {
        'dot-pattern': "radial-gradient(#cbd5e1 1px, transparent 1px)",
        'dot-pattern-dark': "radial-gradient(#1e293b 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
