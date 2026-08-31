/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Light mode colors (Cream White)
        cream: {
          50: "#FFFDF7",
          100: "#FFF9E8",
          200: "#FFF3D1",
          300: "#FFEDBA",
          400: "#FFE7A3",
          500: "#F5DEB3", // Main cream
          600: "#E6D0A3",
          700: "#D4C494",
          800: "#C2B885",
          900: "#B0AC76",
        },
        // Dark mode colors (Charcoal)
        dark: {
          50: "#E8E8E9",
          100: "#D1D1D3",
          200: "#A3A3A7",
          300: "#75757B",
          400: "#4A4A51",
          500: "#28282B", // Main dark
          600: "#202023",
          700: "#18181A",
          800: "#101012",
          900: "#080809",
        },
      },
    },
  },
  plugins: [],
};
