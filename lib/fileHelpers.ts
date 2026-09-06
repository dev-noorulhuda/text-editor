import type { FileResult } from "@/types/editorTypes";
import { getMimeTypeForFileName } from "@/lib/languageRegistry";
import { pick, saveDocuments, types } from "@react-native-documents/picker";
import { File, Paths } from "expo-file-system";
import { readAsStringAsync, writeAsStringAsync } from "expo-file-system/legacy";

const extractFileName = (uri: string, fallback: string): string => {
  try {
    const decoded = decodeURIComponent(uri);
    const parts = decoded.split("/");
    const last = parts[parts.length - 1]?.trim();
    if (last && !last.includes(":") && last.includes(".")) {
      return last;
    }
    if (last && last.includes(":")) {
      const colonParts = last.split(":");
      const afterColon = colonParts[colonParts.length - 1];
      if (afterColon && afterColon.includes(".")) {
        return afterColon;
      }
    }
  } catch {
    // ignore
  }
  return fallback;
};

export const openFile = async (): Promise<FileResult> => {
  try {
    const results = await pick({
      type: [types.allFiles, "*/*"],
      mode: "open",
      requestLongTermAccess: true,
    });

    if (!results || results.length === 0) {
      return { success: false };
    }

    const picked = results[0];
    if (!picked) {
      return { success: false };
    }

    let rawContent = "";
    try {
      const file = new File(picked.uri);
      rawContent = file.textSync();
    } catch {
      rawContent = await readAsStringAsync(picked.uri, { encoding: "utf8" });
    }

    const cleanContent = rawContent.replace(/\0/g, "");
    const content = cleanContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const fileName = picked.name || extractFileName(picked.uri, "Untitled.txt");

    return {
      success: true,
      content,
      fileName,
      uri: picked.uri,
    };
  } catch {
    return { success: false };
  }
};

export const saveFile = async (
  content: string,
  fileUri: string,
): Promise<FileResult> => {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  try {
    await writeAsStringAsync(fileUri, normalized);
    return { success: true };
  } catch {
    try {
      const file = new File(fileUri);
      file.write(normalized);
      return { success: true };
    } catch {
      return { success: false };
    }
  }
};

export const saveFileAs = async (
  content: string,
  fileName: string,
): Promise<FileResult> => {
  try {
    const safeName =
      fileName === "Untitled"
        ? "Untitled.txt"
        : fileName.includes(".")
          ? fileName
          : `${fileName}.txt`;

    const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const tempFile = new File(Paths.cache, safeName);
    tempFile.write(normalized);

    const mimeType = getMimeTypeForFileName(safeName);
    const results = await saveDocuments({
      sourceUris: [tempFile.uri],
      mimeType,
      fileName: safeName,
    });

    if (!results || results.length === 0) {
      return { success: false };
    }

    const saved = results[0];
    if (saved.error) {
      return { success: false };
    }

    const resolvedName = saved.name || extractFileName(saved.uri, safeName);

    return { success: true, uri: saved.uri, fileName: resolvedName };
  } catch {
    return { success: false };
  }
};
