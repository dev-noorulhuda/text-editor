import type { FontFamily } from "@/lib/settingsStore";
import { Platform } from "react-native";

export const resolveFontFamily = (
  family?: FontFamily | string,
  isCode?: boolean,
): string => {
  if (family === "monospace" || (isCode && (!family || family === "system"))) {
    return Platform.select({
      android: "monospace",
      ios: "Menlo",
      default: "monospace",
    });
  }
  if (family === "serif") {
    return Platform.select({
      android: "serif",
      ios: "Georgia",
      default: "serif",
    });
  }
  return Platform.select({
    android: "sans-serif",
    ios: "System",
    default: "sans-serif",
  });
};
