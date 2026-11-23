import {
  enqueueIncomingFileUri,
  extractIncomingFileUri,
} from "@/lib/incomingFileQueue";

export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  try {
    const fileUri = extractIncomingFileUri(path);
    if (fileUri) {
      enqueueIncomingFileUri(fileUri);
      return "/";
    }
  } catch {
    return "/";
  }

  return path;
}
