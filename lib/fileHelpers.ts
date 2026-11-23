import { extractFileName, sanitizeFileName } from "@/lib/filePathUtils";
import type { FileResult } from "@/types/editorTypes";
import { textEncode } from "@borewit/text-codec";
import { File, FileMode, Paths } from "expo-file-system";
import { readAsStringAsync, writeAsStringAsync } from "expo-file-system/legacy";

type DocumentPickerModule = typeof import("@react-native-documents/picker");

const loadDocumentPicker = (): DocumentPickerModule | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@react-native-documents/picker") as DocumentPickerModule;
  } catch {
    return null;
  }
};

const normalizeContent = (raw: string): string =>
  raw.replace(/\0/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const readUriText = async (uri: string): Promise<string> => {
  try {
    const file = new File(uri);
    return await file.text();
  } catch {
    try {
      const file = new File(uri);
      return file.textSync();
    } catch {
      return await readAsStringAsync(uri, { encoding: "utf8" });
    }
  }
};

export const openFileFromUri = async (
  uri: string,
  suggestedName?: string,
): Promise<FileResult> => {
  try {
    const rawContent = await readUriText(uri);
    const content = normalizeContent(rawContent);
    const fileName =
      suggestedName?.trim() || extractFileName(uri, "Untitled.txt");

    return {
      success: true,
      content,
      fileName,
      uri,
    };
  } catch {
    return { success: false };
  }
};

export const openFile = async (): Promise<FileResult> => {
  const picker = loadDocumentPicker();

  if (picker) {
    try {
      const results = await picker.pick({
        type: [picker.types.allFiles, "*/*"],
        mode: "open",
        requestLongTermAccess: true,
      });

      const picked = results?.[0];
      if (!picked) {
        return { success: false };
      }

      return await openFileFromUri(picked.uri, picked.name ?? undefined);
    } catch {
      return { success: false };
    }
  }

  try {
    const picked = await File.pickFileAsync({ mimeTypes: ["*/*"] });
    if (picked.canceled || !picked.result) {
      return { success: false };
    }
    return await openFileFromUri(picked.result.uri);
  } catch {
    return { success: false };
  }
};

const writeViaHandle = async (
  file: File,
  bytes: Uint8Array,
  mode: FileMode,
): Promise<void> => {
  const handle = file.open(mode);
  try {
    await handle.writeBytes(bytes);
  } finally {
    handle.close();
  }
};

export const saveFile = async (
  content: string,
  fileUri: string,
): Promise<FileResult> => {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const bytes = textEncode(normalized, "utf-8");

  try {
    const file = new File(fileUri);
    await writeViaHandle(file, bytes, FileMode.Truncate);
    return { success: true };
  } catch {
    // Some Android providers reject "wt"; retry with "w" handle
  }

  try {
    const file = new File(fileUri);
    await writeViaHandle(file, bytes, FileMode.WriteOnly);
    return { success: true };
  } catch {
    // Fallback to direct File.write
  }

  try {
    const file = new File(fileUri);
    file.write(normalized);
    return { success: true };
  } catch {
    // Fallback to legacy Expo FileSystem writer
  }

  try {
    await writeAsStringAsync(fileUri, normalized);
    return { success: true };
  } catch {
    return { success: false };
  }
};

export const saveFileAs = async (
  content: string,
  fileName: string,
): Promise<FileResult> => {
  const picker = loadDocumentPicker();
  if (!picker) {
    return { success: false };
  }

  try {
    const cleaned = sanitizeFileName(fileName) || "Untitled";
    const safeName =
      cleaned === "Untitled"
        ? "Untitled.txt"
        : cleaned.includes(".")
          ? cleaned
          : `${cleaned}.txt`;

    const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const tempFile = new File(Paths.cache, safeName);
    tempFile.write(normalized);

    const results = await picker.saveDocuments({
      sourceUris: [tempFile.uri],
      mimeType: "*/*",
      fileName: safeName,
    });

    const saved = results?.[0];
    if (!saved || saved.error) {
      return { success: false };
    }

    const resolvedName = saved.name || extractFileName(saved.uri, safeName);
    return { success: true, uri: saved.uri, fileName: resolvedName };
  } catch {
    return { success: false };
  }
};
