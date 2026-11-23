import { getTabsAfterClose, saveAndCloseFile } from "@/lib/editorAlerts";
import {
  deleteFileContent,
  persistTabs,
  saveFileContent,
} from "@/lib/tabStore";
import type { FileData } from "@/types/editorTypes";
import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

export const useTabClose = (
  files: FileData[],
  activeFileId: string,
  setFiles: Dispatch<SetStateAction<FileData[]>>,
  setActiveFileId: (id: string) => void,
) => {
  const [closingFile, setClosingFile] = useState<FileData | null>(null);

  const performClose = useCallback(
    (id: string) => {
      deleteFileContent(id);
      setFiles((prev) => {
        const { updated, nextActiveId } = getTabsAfterClose(
          prev,
          id,
          activeFileId,
        );
        persistTabs(updated);
        if (nextActiveId) {
          setActiveFileId(nextActiveId);
          if (updated.length === 1 && updated[0]?.id === nextActiveId) {
            saveFileContent(nextActiveId, "");
          }
        }
        return updated;
      });
    },
    [activeFileId, setFiles, setActiveFileId],
  );

  const handleClose = useCallback(
    (id: string) => {
      const target = files.find((f) => f.id === id);
      if (!target) return;
      if (!target.isModified) {
        performClose(id);
        return;
      }
      setClosingFile(target);
    },
    [files, performClose],
  );

  const handleDiscardClose = useCallback(() => {
    if (!closingFile) return;
    const id = closingFile.id;
    setClosingFile(null);
    performClose(id);
  }, [closingFile, performClose]);

  const handleSaveClose = useCallback(async () => {
    if (!closingFile) return;
    const ok = await saveAndCloseFile(closingFile, performClose);
    if (ok) setClosingFile(null);
  }, [closingFile, performClose]);

  const handleCancelClose = useCallback(() => setClosingFile(null), []);

  return {
    closingFile,
    handleClose,
    handleDiscardClose,
    handleSaveClose,
    handleCancelClose,
  };
};
