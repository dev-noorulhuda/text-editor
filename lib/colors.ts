export const colors = {
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
  dark: {
    50: "#E8E8E9",
    100: "#D1D1D3",
    200: "#A3A3A7",
    300: "#75757B",
    400: "#4A4A51",
    500: "#28282B",
    600: "#202023",
    700: "#18181A",
    800: "#101012",
    900: "#080809",
  },
  link: {
    light: "#2563EB",
    dark: "#60A5FA",
  },
  selection: {
    light: "rgba(37, 99, 235, 0.25)",
    dark: "rgba(96, 165, 250, 0.30)",
  },
  // Non-zero alpha (alpha=5/255) avoids Android Fabric UndefinedColor (0) black fallback
  invisibleText: {
    light: "rgba(0, 0, 0, 0.02)",
    dark: "rgba(255, 255, 255, 0.02)",
  },
  match: {
    light: "rgba(250, 204, 21, 0.38)",
    dark: "rgba(250, 204, 21, 0.28)",
  },
  activeMatch: {
    light: "rgba(249, 115, 22, 0.45)",
    dark: "rgba(249, 115, 22, 0.50)",
  },
} as const;
