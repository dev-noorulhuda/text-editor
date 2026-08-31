import { File, Paths } from "expo-file-system";
import { pick, saveDocuments } from "@react-native-documents/picker";
import type { FileResult } from "@/types/editorTypes";

export const openFile = async (): Promise<FileResult> => {
  try {
    const results = await pick({ type: ["text/*"] });

    if (!results || results.length === 0) {
      return { success: false };
    }

    const picked = results[0];
    const file = new File(picked.uri);
    const content = file.textSync();

    return {
      success: true,
      content,
      fileName: picked.name ?? "Untitled",
      uri: picked.uri,
    };
  } catch (error) {
    console.error("Failed to open file:", error);
    return { success: false };
  }
};

export const saveFile = async (
  content: string,
  fileUri: string
): Promise<FileResult> => {
  try {
    const file = new File(fileUri);
    file.write(content);
    return { success: true };
  } catch (error) {
    console.error("Failed to save file:", error);
    return { success: false };
  }
};

export const saveFileAs = async (
  content: string,
  fileName: string
): Promise<FileResult> => {
  try {
    const tempFile = new File(Paths.cache, fileName);
    tempFile.write(content);

    const results = await saveDocuments({
      sourceUris: [tempFile.uri],
      mimeType: "text/plain",
      fileName,
    });

    if (!results || results.length === 0) {
      return { success: false };
    }

    const saved = results[0];
    if (saved.error) {
      return { success: false };
    }

    return { success: true, uri: saved.uri };
  } catch (error) {
    console.error("Failed to save file:", error);
    return { success: false };
  }
};
