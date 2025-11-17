/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/App.tsx",
    "./src/components/*.tsx",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Performance optimizations
  corePlugins: {
    preflight: true,
  },
  safelist: []
}

