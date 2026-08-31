import { File } from "expo-file-system";
import type { FileResult } from "@/types/editorTypes";

export const openFile = async (): Promise<FileResult> => {
  try {
    const file = await File.pickFileAsync(undefined, "text/*");

    if (!file) {
      return { success: false };
    }

    const pickedFile = Array.isArray(file) ? file[0] : file;
    if (!pickedFile) {
      return { success: false };
    }

    const content = pickedFile.textSync();

    return { success: true, content, fileName: pickedFile.name, uri: pickedFile.uri };
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

export const saveFileAs = async (content: string): Promise<FileResult> => {
  try {
    const file = await File.pickFileAsync(undefined, "text/*");

    if (!file) {
      return { success: false };
    }

    const pickedFile = Array.isArray(file) ? file[0] : file;
    if (!pickedFile) {
      return { success: false };
    }

    pickedFile.write(content);

    return { success: true, uri: pickedFile.uri };
  } catch (error) {
    console.error("Failed to save file:", error);
    return { success: false };
  }
};
