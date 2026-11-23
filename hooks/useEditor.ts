import { useEditorHistory } from "@/hooks/useEditorHistory";
import { useEditorSettings } from "@/hooks/useEditorSettings";
import { useIncomingFile } from "@/hooks/useIncomingFile";
import { useTabClose } from "@/hooks/useTabClose";
import { mergeOpenedFile } from "@/lib/editorAlerts";
import {
  openFile,
  openFileFromUri,
  saveFile,
  saveFileAs,
} from "@/lib/fileHelpers";
import { renameFileOnDisk } from "@/lib/filePathUtils";
import {
  generateId,
  loadActiveTabId,
  loadInitialFiles,
  persistTabs,
  saveActiveTabId,
  saveFileContent,
} from "@/lib/tabStore";
import type { FileData, FileResult } from "@/types/editorTypes";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

export type SaveOutcome = "saved" | "saved_as" | "cancelled";

export const useEditor = () => {
  const [files, setFiles] = useState<FileData[]>(loadInitialFiles);
  const [activeFileId, setActiveFileIdState] = useState(() => {
    const savedActiveId = loadActiveTabId();
    if (savedActiveId && files.some((f) => f.id === savedActiveId)) {
      return savedActiveId;
    }
    return files[0]?.id ?? "";
  });

  const setActiveFileId = useCallback((id: string) => {
    setActiveFileIdState(id);
    saveActiveTabId(id);
  }, []);

  const activeFile = files.find((f) => f.id === activeFileId) ?? files[0];
  const activeFileRef = useRef(activeFile);
  activeFileRef.current = activeFile;

  const settings = useEditorSettings();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const flushActive = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (activeFileRef.current) {
        saveFileContent(
          activeFileRef.current.id,
          activeFileRef.current.content,
        );
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        if (status === "background" || status === "inactive") {
          flushActive();
        }
      },
    );

    return () => {
      subscription.remove();
      flushActive();
    };
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<FileData>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  }, []);

  const { canUndo, canRedo, recordChange, handleUndo, handleRedo } =
    useEditorHistory(activeFile, updateFile, saveFileContent);

  const applyOpenedFile = useCallback(
    (result: FileResult) => {
      if (!result.success || result.content === undefined) return;
      let targetId = "";
      let contentToSave = result.content;

      setFiles((prev) => {
        const merged = mergeOpenedFile(prev, result);
        targetId = merged.targetId;
        contentToSave = merged.content;
        persistTabs(merged.updated);
        return merged.updated;
      });

      if (targetId) {
        setActiveFileId(targetId);
        saveFileContent(targetId, contentToSave);
      }
    },
    [setActiveFileId],
  );

  const handleOpenUri = useCallback(
    async (uri: string) => {
      const result = await openFileFromUri(uri);
      applyOpenedFile(result);
    },
    [applyOpenedFile],
  );

  useIncomingFile((uri) => {
    void handleOpenUri(uri);
  });

  const handleContentChange = useCallback(
    (text: string) => {
      if (!activeFile) return;
      recordChange(text);
      updateFile(activeFile.id, { content: text, isModified: true });

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      const fileId = activeFile.id;
      saveTimeoutRef.current = setTimeout(
        () => saveFileContent(fileId, text),
        300,
      );
    },
    [activeFile, recordChange, updateFile],
  );

  const handleNew = useCallback(() => {
    const newId = generateId();
    const newFile: FileData = {
      id: newId,
      name: "Untitled",
      content: "",
      uri: null,
      isModified: false,
    };

    setFiles((prev) => {
      const updated = [...prev, newFile];
      persistTabs(updated);
      return updated;
    });
    setActiveFileId(newId);
    saveFileContent(newId, "");
  }, [setActiveFileId]);

  const handleOpen = useCallback(async () => {
    const result = await openFile();
    applyOpenedFile(result);
  }, [applyOpenedFile]);

  const handleRename = useCallback((newName: string): boolean => {
    const target = activeFileRef.current;
    if (!target) return false;
    const renamed = renameFileOnDisk(target.uri, newName);
    if (!renamed.success) return false;

    setFiles((prev) => {
      const updated = prev.map((f) =>
        f.id === target.id
          ? { ...f, name: renamed.name, uri: renamed.uri }
          : f,
      );
      persistTabs(updated);
      return updated;
    });
    return true;
  }, []);

  const handleSaveAs = useCallback(async (): Promise<SaveOutcome> => {
    const target = activeFileRef.current;
    if (!target) return "cancelled";

    const result = await saveFileAs(target.content, target.name);
    if (result.success && result.uri) {
      const newName = result.fileName ?? target.name;
      saveFileContent(target.id, target.content);
      setFiles((prev) => {
        const updated = prev.map((f) =>
          f.id === target.id
            ? { ...f, uri: result.uri!, name: newName, isModified: false }
            : f,
        );
        persistTabs(updated);
        return updated;
      });
      return "saved_as";
    }
    return "cancelled";
  }, []);

  const handleSave = useCallback(async (): Promise<SaveOutcome> => {
    const target = activeFileRef.current;
    if (!target) return "cancelled";

    if (target.uri) {
      const result = await saveFile(target.content, target.uri);
      if (result.success) {
        saveFileContent(target.id, target.content);
        setFiles((prev) => {
          const updated = prev.map((f) =>
            f.id === target.id ? { ...f, isModified: false } : f,
          );
          persistTabs(updated);
          return updated;
        });
        return "saved";
      }
    }

    return await handleSaveAs();
  }, [handleSaveAs]);

  const tabClose = useTabClose(files, activeFileId, setFiles, setActiveFileId);

  return {
    activeFile,
    activeFileId,
    files,
    canUndo,
    canRedo,
    ...settings,
    ...tabClose,
    handleContentChange,
    handleNew,
    handleOpen,
    handleRename,
    handleSave,
    handleSaveAs,
    handleUndo,
    handleRedo,
    setActiveFileId,
  };
};
