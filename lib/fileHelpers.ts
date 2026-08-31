import { File, Paths } from "expo-file-system";

const AUTOSAVE_FILE = "autosave.txt";

export interface FileResult {
  success: boolean;
  content?: string;
  fileName?: string;
  error?: string;
}

export const autoSave = async (content: string): Promise<boolean> => {
  try {
    const file = new File(Paths.document, AUTOSAVE_FILE);
    file.write(content);
    return true;
  } catch {
    return false;
  }
};

export const loadAutoSave = (): string | null => {
  try {
    const file = new File(Paths.document, AUTOSAVE_FILE);
    if (file.exists) {
      return file.textSync();
    }
    return null;
  } catch {
    return null;
  }
};

export const openFile = async (): Promise<FileResult> => {
  try {
    const file = await File.pickFileAsync(undefined, "text/*");

    if (!file) {
      return { success: false, error: "User cancelled" };
    }

    const pickedFile = Array.isArray(file) ? file[0] : file;
    if (!pickedFile) {
      return { success: false, error: "No file selected" };
    }

    const content = pickedFile.textSync();

    return { success: true, content, fileName: pickedFile.name };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to open file",
    };
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save file",
    };
  }
};

export const saveFileAs = async (content: string): Promise<FileResult> => {
  try {
    const file = await File.pickFileAsync(undefined, "text/*");

    if (!file) {
      return { success: false, error: "User cancelled" };
    }

    const pickedFile = Array.isArray(file) ? file[0] : file;
    if (!pickedFile) {
      return { success: false, error: "No file selected" };
    }

    pickedFile.write(content);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save file",
    };
  }
};

export const createNewFile = (): FileResult => {
  return { success: true, content: "", fileName: "Untitled" };
};
