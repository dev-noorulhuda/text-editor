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
        // Light mode colors (White)
        white: {
          50: "#FFFFFF",
          100: "#F9FAFB",
          200: "#F3F4F6",
          300: "#E5E7EB",
          400: "#D1D5DB",
          500: "#9CA3AF",
          600: "#6B7280",
          700: "#4B5563",
          800: "#374151",
          900: "#111827",
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
