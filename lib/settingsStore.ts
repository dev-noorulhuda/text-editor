import { File, Paths } from "expo-file-system";
import { Appearance } from "react-native";

const SETTINGS_FILE = "settings.json";

export type FontFamily = "monospace" | "system" | "serif";

export interface AppSettings {
  colorScheme: "light" | "dark";
  isEditable: boolean;
  fontSize: number;
  fontFamily: FontFamily;
  highlightLine: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  edgeSpacing: number;
  openKeyboardAtStart: boolean;
  clearSessionOnRestart: boolean;
}

export const getSystemColorScheme = (): "light" | "dark" => {
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
};

const DEFAULTS: AppSettings = {
  colorScheme: "light",
  isEditable: true,
  fontSize: 16,
  fontFamily: "system",
  highlightLine: true,
  showLineNumbers: false,
  wordWrap: false,
  edgeSpacing: 2,
  openKeyboardAtStart: false,
  clearSessionOnRestart: false,
};

export const loadSettings = (): AppSettings => {
  const systemTheme = getSystemColorScheme();
  const initialDefaults: AppSettings = {
    ...DEFAULTS,
    colorScheme: systemTheme,
  };
  try {
    const file = new File(Paths.document, SETTINGS_FILE);
    if (file.exists) {
      const data = JSON.parse(file.textSync()) as Partial<AppSettings>;
      return { ...initialDefaults, ...data };
    }
  } catch {
    // ignore
  }
  return { ...initialDefaults };
};

export const saveSettings = (settings: Partial<AppSettings>): void => {
  try {
    const current = loadSettings();
    const merged = { ...current, ...settings };
    const file = new File(Paths.document, SETTINGS_FILE);
    file.write(JSON.stringify(merged));
  } catch {
    // ignore
  }
};
