import { useEffect, useState, useCallback, useRef } from "react";
import { openFile, saveFile, saveFileAs } from "@/lib/fileHelpers";
import {
  generateId,
  loadInitialFiles,
  persistTabs,
  saveFileContent,
  deleteFileContent,
} from "@/lib/tabStore";
import type { FileData } from "@/types/editorTypes";

export const useEditor = () => {
  const [files, setFiles] = useState<FileData[]>(loadInitialFiles);
  const [activeFileId, setActiveFileId] = useState(() => files[0]?.id ?? "");
  const activeFile = files.find((f) => f.id === activeFileId) ?? files[0];

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const updateFile = useCallback(
    (id: string, updates: Partial<FileData>) => {
      setFiles((prev) => {
        const updated = prev.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        );
        persistTabs(updated);
        return updated;
      });
    },
    []
  );

  const handleContentChange = useCallback(
    (text: string) => {
      if (!activeFile) return;

      updateFile(activeFile.id, { content: text, isModified: true });

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveFileContent(activeFile.id, text);
      }, 500);
    },
    [activeFile, updateFile]
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
  }, []);

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
  }, []);

  const handleSaveAs = useCallback(async () => {
    if (!activeFile) return;

    const result = await saveFileAs(activeFile.content);
    if (result.success && result.uri) {
      updateFile(activeFile.id, {
        uri: result.uri,
        isModified: false,
      });
    }
  }, [activeFile, updateFile]);

  const handleSave = useCallback(async () => {
    if (!activeFile) return;

    if (activeFile.uri) {
      const result = await saveFile(activeFile.content, activeFile.uri);
      if (result.success) {
        updateFile(activeFile.id, { isModified: false });
      }
    } else {
      await handleSaveAs();
    }
  }, [activeFile, updateFile, handleSaveAs]);

  const handleClose = useCallback(
    (id: string) => {
      setFiles((prev) => {
        if (prev.length === 1) {
          const newId = generateId();
          const newFile: FileData = {
            id: newId,
            name: "Untitled",
            content: "",
            uri: null,
            isModified: false,
          };
          deleteFileContent(id);
          persistTabs([newFile]);
          setActiveFileId(newId);
          return [newFile];
        }

        const updated = prev.filter((f) => f.id !== id);
        deleteFileContent(id);
        persistTabs(updated);

        if (activeFileId === id) {
          setActiveFileId(updated[0]?.id ?? "");
        }

        return updated;
      });
    },
    [activeFileId]
  );

  return {
    activeFile,
    activeFileId,
    files,
    handleContentChange,
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleClose,
    setActiveFileId,
  };
};
