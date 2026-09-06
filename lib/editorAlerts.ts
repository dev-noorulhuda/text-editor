import { generateId } from "@/lib/tabStore";
import type { FileData } from "@/types/editorTypes";
import { Alert } from "react-native";

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

export const confirmCloseFile = (
  file: FileData | undefined,
  onConfirmClose: () => void,
  onSaveAndClose: () => Promise<void>,
): void => {
  if (!file || !file.isModified) {
    onConfirmClose();
    return;
  }

  Alert.alert(
    "Unsaved Changes",
    `Do you want to save changes to "${file.name}" before closing?`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Close Anyway",
        style: "destructive",
        onPress: onConfirmClose,
      },
      {
        text: "Save",
        onPress: () => {
          void onSaveAndClose();
        },
      },
    ],
  );
};
