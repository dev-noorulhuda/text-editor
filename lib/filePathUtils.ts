import { File } from "expo-file-system";

export interface RenameFileResult {
  success: boolean;
  name: string;
  uri: string | null;
  renamedOnDisk: boolean;
}

export const sanitizeFileName = (rawName: string): string =>
  rawName.trim().replace(/[/\\:*?"<>|]/g, "_");

export const extractFileName = (uri: string, fallback: string): string => {
  try {
    const withoutQuery = uri.split("?")[0] ?? uri;
    const decoded = decodeURIComponent(withoutQuery);
    const parts = decoded.split("/").filter(Boolean);
    const last = parts[parts.length - 1]?.trim();

    if (last && last.includes(":")) {
      const colonParts = last.split(":");
      const afterColon = colonParts[colonParts.length - 1]?.trim();
      if (afterColon && !/^\d+$/.test(afterColon)) {
        return afterColon;
      }
    }

    if (last && !last.includes(":") && !/^\d+$/.test(last)) {
      return last;
    }
  } catch {
    // ignore decode errors
  }
  return fallback;
};

export const renameFileOnDisk = (
  fileUri: string | null,
  newName: string,
): RenameFileResult => {
  const sanitized = sanitizeFileName(newName);
  if (!sanitized || sanitized === "." || sanitized === "..") {
    return { success: false, name: newName, uri: fileUri, renamedOnDisk: false };
  }

  if (fileUri && fileUri.startsWith("file://")) {
    try {
      const file = new File(fileUri);
      file.rename(sanitized);
      return {
        success: true,
        name: sanitized,
        uri: file.uri,
        renamedOnDisk: true,
      };
    } catch {
      return {
        success: true,
        name: sanitized,
        uri: fileUri,
        renamedOnDisk: false,
      };
    }
  }

  return {
    success: true,
    name: sanitized,
    uri: fileUri,
    renamedOnDisk: false,
  };
};
