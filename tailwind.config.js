
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
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
