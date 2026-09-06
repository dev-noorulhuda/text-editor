import type { FontFamily } from "@/lib/settingsStore";
import { Platform } from "react-native";

export const resolveFontFamily = (family?: FontFamily | string): string => {
  if (family === "serif") {
    return Platform.select({
      android: "serif",
      ios: "Georgia",
      default: "serif",
    });
  }
  if (family === "monospace") {
    return Platform.select({
      android: "monospace",
      ios: "Menlo",
      default: "monospace",
    });
  }
  return Platform.select({
    android: "sans-serif",
    ios: "System",
    default: "sans-serif",
  });
};
