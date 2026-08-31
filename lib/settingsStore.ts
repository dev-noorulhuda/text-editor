import { File, Paths } from "expo-file-system";

const SETTINGS_FILE = "settings.json";

export interface AppSettings {
  colorScheme: "light" | "dark";
  isEditable: boolean;
  fontSize: number;
  highlightLine: boolean;
  showLineNumbers: boolean;
}

const DEFAULTS: AppSettings = {
  colorScheme: "light",
  isEditable: true,
  fontSize: 16,
  highlightLine: true,
  showLineNumbers: false,
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

export const saveSettings = (settings: AppSettings): void => {
  try {
    const file = new File(Paths.document, SETTINGS_FILE);
    file.write(JSON.stringify(settings));
  } catch {
    // ignore
  }
};
