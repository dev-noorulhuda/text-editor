import { saveFile, saveFileAs } from "@/lib/fileHelpers";
import { deleteFileContent, generateId } from "@/lib/tabStore";
import type { FileData, FileResult } from "@/types/editorTypes";

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

export const mergeOpenedFile = (
  prev: FileData[],
  result: FileResult,
): { updated: FileData[]; targetId: string; content: string } => {
  const content = result.content ?? "";
  const uri = result.uri ?? null;
  const name = result.fileName ?? "Untitled";

  if (uri) {
    const existing = prev.find((f) => f.uri === uri);
    if (existing) {
      const updated = prev.map((f) =>
        f.id === existing.id && !f.isModified ? { ...f, content, name } : f,
      );
      return {
        updated,
        targetId: existing.id,
        content: existing.isModified ? existing.content : content,
      };
    }
  }

  const newId = generateId();
  const newFile: FileData = {
    id: newId,
    name,
    content,
    uri,
    isModified: false,
  };

  const onlyTab = prev.length === 1 ? prev[0] : undefined;
  if (
    onlyTab &&
    !onlyTab.uri &&
    !onlyTab.isModified &&
    onlyTab.content === ""
  ) {
    deleteFileContent(onlyTab.id);
    return { updated: [newFile], targetId: newId, content };
  }

  return { updated: [...prev, newFile], targetId: newId, content };
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
  }

  const res = await saveFileAs(target.content, target.name);
  if (res.success) {
    onClose(target.id);
    return true;
  }
  return false;
};
