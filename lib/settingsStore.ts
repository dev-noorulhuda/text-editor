import { File, Paths } from "expo-file-system";

const SETTINGS_FILE = "settings.json";

export type FontFamily = "monospace" | "system" | "serif";

export interface AppSettings {
  colorScheme: "light" | "dark";
  isEditable: boolean;
  fontSize: number;
  fontFamily: FontFamily;
  highlightLine: boolean;
  showLineNumbers: boolean;
  edgeSpacing: number;
  openKeyboardAtStart: boolean;
}

const DEFAULTS: AppSettings = {
  colorScheme: "light",
  isEditable: true,
  fontSize: 16,
  fontFamily: "system",
  highlightLine: true,
  showLineNumbers: false,
  edgeSpacing: 2,
  openKeyboardAtStart: false,
};

export const loadSettings = (): AppSettings => {
  try {
    const file = new File(Paths.document, SETTINGS_FILE);
    if (file.exists) {
      const data = JSON.parse(file.textSync()) as Partial<AppSettings>;
      return { ...DEFAULTS, ...data };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULTS };
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
