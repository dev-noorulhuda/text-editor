import { File, Paths } from "expo-file-system";
import type { FileData, TabMetadata } from "@/types/editorTypes";

const TABS_DIR = "tabs";
const TABS_INDEX = "tabs_index.json";
const TABS_META = "tabs_meta.json";

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

export const loadTabsIndex = (): string[] => {
  try {
    const file = new File(Paths.document, TABS_INDEX);
    if (file.exists) {
      return JSON.parse(file.textSync()) as string[];
    }
  } catch {
    // ignore
  }
  return [];
};

export const saveTabsIndex = (ids: string[]): void => {
  try {
    const dir = new File(Paths.document, TABS_DIR).parentDirectory;
    if (!dir.exists) {
      dir.create();
    }
    const file = new File(Paths.document, TABS_INDEX);
    file.write(JSON.stringify(ids));
  } catch {
    // ignore
  }
};

export const loadFileContent = (id: string): string => {
  try {
    const file = new File(Paths.document, TABS_DIR, `${id}.txt`);
    console.log(`[LOAD] ${id}.txt exists=${file.exists} → ${file.uri}`);
    if (file.exists) {
      return file.textSync();
    }
  } catch (e) {
    console.error("[LOAD FAILED]", e);
  }
  return "";
};

export const saveFileContent = (id: string, content: string): void => {
  try {
    const dir = new File(Paths.document, TABS_DIR);
    if (!dir.exists) {
      dir.create();
    }
    const file = new File(Paths.document, TABS_DIR, `${id}.txt`);
    file.write(content);
    console.log(`[SAVED] ${id}.txt (${content.length} chars) → ${file.uri}`);
  } catch (e) {
    console.error("[SAVE FAILED]", e);
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
      return JSON.parse(file.textSync()) as Record<string, TabMetadata>;
    }
  } catch {
    // ignore
  }
  return {};
};

export const saveMetaData = (meta: Record<string, TabMetadata>): void => {
  try {
    const file = new File(Paths.document, TABS_META);
    file.write(JSON.stringify(meta));
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
  console.log(`[INIT] ids=${JSON.stringify(ids)} meta=${JSON.stringify(meta)}`);

  if (ids.length === 0) {
    return [
      {
        id: generateId(),
        name: "Untitled",
        content: "",
        uri: null,
        isModified: false,
      },
    ];
  }

  return ids.map((id) => ({
    id,
    name: meta[id]?.name ?? "Untitled",
    content: loadFileContent(id),
    uri: meta[id]?.uri ?? null,
    isModified: false,
  }));
};
