import { saveFile, saveFileAs } from "@/lib/fileHelpers";
import { generateId } from "@/lib/tabStore";
import type { FileData } from "@/types/editorTypes";

export const getTabsAfterClose = (
  prev: FileData[],
  id: string,
  activeFileId: string,
): { updated: FileData[]; nextActiveId?: string } => {
  if (prev.length <= 1) {
    const newId = generateId();
    const newFile: FileData = {
      id: newId,
      name: "Untitled",
      content: "",
      uri: null,
      isModified: false,
    };
    return { updated: [newFile], nextActiveId: newId };
  }

  const closedIndex = prev.findIndex((f) => f.id === id);
  const updated = prev.filter((f) => f.id !== id);
  let nextActiveId: string | undefined;

  if (activeFileId === id) {
    const nextIndex = Math.min(
      closedIndex === -1 ? 0 : closedIndex,
      updated.length - 1,
    );
    const nextActive = updated[Math.max(0, nextIndex)];
    if (nextActive) {
      nextActiveId = nextActive.id;
    }
  }

  return { updated, nextActiveId };
};

export const saveAndCloseFile = async (
  target: FileData,
  onClose: (id: string) => void,
): Promise<boolean> => {
  if (target.uri) {
    const res = await saveFile(target.content, target.uri);
    if (res.success) {
      onClose(target.id);
      return true;
    }
  } else {
    const res = await saveFileAs(target.content, target.name);
    if (res.success) {
      onClose(target.id);
      return true;
    }
  }
  return false;
};
