/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Node connection colors
        'node-image': '#00b894',
        'node-mask': '#dfe6e9',
        'node-number': '#0984e3',
        'node-color': '#fdcb6e',
        'node-bbox': '#e17055',
        // UI colors
        'bg-primary': '#1e1e1e',
        'bg-secondary': '#2d2d2d',
        'bg-tertiary': '#3d3d3d',
        'text-primary': '#ffffff',
        'text-secondary': '#b0b0b0',
        'border-color': '#404040',
      },
    },
  },
  plugins: [],
}
