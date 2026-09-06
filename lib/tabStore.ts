import type { FileData, TabMetadata } from "@/types/editorTypes";
import { Directory, File, Paths } from "expo-file-system";

const TABS_DIR = "tabs";
const TABS_INDEX = "tabs_index.json";
const TABS_META = "tabs_meta.json";
const ACTIVE_TAB_FILE = "active_tab.json";

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

const ensureTabsDirectory = (): Directory => {
  const dir = new Directory(Paths.document, TABS_DIR);
  try {
    const file = new File(Paths.document, TABS_DIR);
    if (file.exists) {
      try {
        const info = file.info();
        if (info.exists) {
          file.delete();
        }
      } catch {
        // file.info() throws when the path is a directory (which is what we want)
      }
    }
  } catch {
    // ignore
  }

  try {
    if (!dir.exists) {
      dir.create({ intermediates: true, idempotent: true });
    }
  } catch {
    // ignore
  }
  return dir;
};

export const loadTabsIndex = (): string[] => {
  try {
    const file = new File(Paths.document, TABS_INDEX);
    if (file.exists) {
      const text = file.textSync();
      if (text) {
        return JSON.parse(text) as string[];
      }
    }
  } catch {
    // ignore
  }
  return [];
};

export const saveTabsIndex = (ids: string[]): void => {
  try {
    const file = new File(Paths.document, TABS_INDEX);
    if (!file.exists) {
      file.create({ overwrite: true });
    }
    file.write(JSON.stringify(ids));
  } catch {
    // ignore
  }
};

export const loadFileContent = (id: string): string => {
  try {
    const file = new File(Paths.document, TABS_DIR, `${id}.txt`);
    if (file.exists) {
      return file.textSync();
    }
  } catch {
    // ignore
  }
  return "";
};

export const saveFileContent = (id: string, content: string): void => {
  try {
    ensureTabsDirectory();
    const file = new File(Paths.document, TABS_DIR, `${id}.txt`);
    if (!file.exists) {
      file.create({ overwrite: true });
    }
    file.write(content);
  } catch {
    // ignore
  }
};

export const deleteFileContent = (id: string): void => {
  try {
    const file = new File(Paths.document, TABS_DIR, `${id}.txt`);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // ignore
  }
};

export const loadMetaData = (): Record<string, TabMetadata> => {
  try {
    const file = new File(Paths.document, TABS_META);
    if (file.exists) {
      const text = file.textSync();
      if (text) {
        return JSON.parse(text) as Record<string, TabMetadata>;
      }
    }
  } catch {
    // ignore
  }
  return {};
};

export const saveMetaData = (meta: Record<string, TabMetadata>): void => {
  try {
    const file = new File(Paths.document, TABS_META);
    if (!file.exists) {
      file.create({ overwrite: true });
    }
    file.write(JSON.stringify(meta));
  } catch {
    // ignore
  }
};

export const loadActiveTabId = (): string | null => {
  try {
    const file = new File(Paths.document, ACTIVE_TAB_FILE);
    if (file.exists) {
      const id = file.textSync().trim();
      return id || null;
    }
  } catch {
    // ignore
  }
  return null;
};

export const saveActiveTabId = (id: string): void => {
  try {
    const file = new File(Paths.document, ACTIVE_TAB_FILE);
    if (!file.exists) {
      file.create({ overwrite: true });
    }
    file.write(id);
  } catch {
    // ignore
  }
};

export const persistTabs = (files: FileData[]): void => {
  const ids = files.map((f) => f.id);
  const meta: Record<string, TabMetadata> = {};

  for (const f of files) {
    meta[f.id] = { name: f.name, uri: f.uri };
  }

  saveTabsIndex(ids);
  saveMetaData(meta);
};

export const loadInitialFiles = (): FileData[] => {
  const ids = loadTabsIndex();
  const meta = loadMetaData();

  if (ids.length === 0) {
    const initialId = generateId();
    const initialFiles: FileData[] = [
      {
        id: initialId,
        name: "Untitled",
        content: "",
        uri: null,
        isModified: false,
      },
    ];
    persistTabs(initialFiles);
    saveActiveTabId(initialId);
    return initialFiles;
  }

  return ids.map((id) => ({
    id,
    name: meta[id]?.name ?? "Untitled",
    content: loadFileContent(id),
    uri: meta[id]?.uri ?? null,
    isModified: false,
  }));
};
