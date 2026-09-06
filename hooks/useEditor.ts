import { useEditorHistory } from "@/hooks/useEditorHistory";
import { useEditorSettings } from "@/hooks/useEditorSettings";
import { confirmCloseFile, getTabsAfterClose } from "@/lib/editorAlerts";
import { openFile, saveFile, saveFileAs } from "@/lib/fileHelpers";
import {
  deleteFileContent,
  generateId,
  loadActiveTabId,
  loadInitialFiles,
  persistTabs,
  saveActiveTabId,
  saveFileContent,
} from "@/lib/tabStore";
import type { FileData } from "@/types/editorTypes";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

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
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        if (status === "background" || status === "inactive") {
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
        }
      },
    );

    return () => {
      subscription.remove();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (activeFileRef.current) {
        saveFileContent(
          activeFileRef.current.id,
          activeFileRef.current.content,
        );
      }
    };
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<FileData>) => {
    setFiles((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
      return updated;
    });
  }, []);

  const { canUndo, canRedo, recordChange, handleUndo, handleRedo } =
    useEditorHistory(activeFile, updateFile, saveFileContent);

  const handleContentChange = useCallback(
    (text: string) => {
      if (!activeFile) return;

      recordChange(text);
      updateFile(activeFile.id, { content: text, isModified: true });

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      const fileId = activeFile.id;
      saveTimeoutRef.current = setTimeout(() => {
        saveFileContent(fileId, text);
      }, 300);
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
    if (result.success && result.content !== undefined) {
      const newId = generateId();
      const newFile: FileData = {
        id: newId,
        name: result.fileName ?? "Untitled",
        content: result.content,
        uri: result.uri ?? null,
        isModified: false,
      };

      setFiles((prev) => {
        const updated = [...prev, newFile];
        persistTabs(updated);
        return updated;
      });
      setActiveFileId(newId);
      saveFileContent(newId, result.content);
    }
  }, [setActiveFileId]);

  const handleSaveAs = useCallback(async () => {
    if (!activeFile) return;

    const result = await saveFileAs(activeFile.content, activeFile.name);
    if (result.success && result.uri) {
      const newName = result.fileName ?? activeFile.name;
      setFiles((prev) => {
        const updated = prev.map((f) =>
          f.id === activeFile.id
            ? { ...f, uri: result.uri!, name: newName, isModified: false }
            : f,
        );
        persistTabs(updated);
        return updated;
      });
    }
  }, [activeFile]);

  const handleSave = useCallback(async () => {
    if (!activeFile) return;

    if (activeFile.uri) {
      const result = await saveFile(activeFile.content, activeFile.uri);
      if (result.success) {
        setFiles((prev) => {
          const updated = prev.map((f) =>
            f.id === activeFile.id ? { ...f, isModified: false } : f,
          );
          persistTabs(updated);
          return updated;
        });
        return;
      }
    }

    await handleSaveAs();
  }, [activeFile, handleSaveAs]);

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
    [activeFileId, setActiveFileId],
  );

  const handleClose = useCallback(
    (id: string) => {
      const target = files.find((f) => f.id === id);
      confirmCloseFile(
        target,
        () => performClose(id),
        async () => {
          if (!target) return;
          if (target.uri) {
            const res = await saveFile(target.content, target.uri);
            if (res.success) performClose(id);
          } else {
            const res = await saveFileAs(target.content, target.name);
            if (res.success) performClose(id);
          }
        },
      );
    },
    [files, performClose],
  );

  return {
    activeFile,
    activeFileId,
    files,
    canUndo,
    canRedo,
    ...settings,
    handleContentChange,
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleUndo,
    handleRedo,
    handleClose,
    setActiveFileId,
  };
};
