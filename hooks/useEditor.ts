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

const MAX_HISTORY = 100;

export const useEditor = () => {
  const [files, setFiles] = useState<FileData[]>(loadInitialFiles);
  const [activeFileId, setActiveFileId] = useState(() => files[0]?.id ?? "");
  const activeFile = files.find((f) => f.id === activeFileId) ?? files[0];

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const undoStackRef = useRef<Map<string, string[]> | null>(null);
  if (!undoStackRef.current) undoStackRef.current = new Map();
  const undoStack = undoStackRef.current;

  const redoStackRef = useRef<Map<string, string[]> | null>(null);
  if (!redoStackRef.current) redoStackRef.current = new Map();
  const redoStack = redoStackRef.current;

  const lastContentRefInner = useRef<Map<string, string> | null>(null);
  if (!lastContentRefInner.current) lastContentRefInner.current = new Map();
  const lastContentRef = lastContentRefInner.current;

  useEffect(() => {
    if (activeFile) {
      setCanUndo((undoStack.get(activeFile.id)?.length ?? 0) > 0);
      setCanRedo((redoStack.get(activeFile.id)?.length ?? 0) > 0);
    } else {
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [activeFileId]);

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

      const lastContent = lastContentRef.get(activeFile.id);
      if (lastContent !== undefined && lastContent !== text) {
        const stack = undoStack.get(activeFile.id) ?? [];
        stack.push(lastContent);
        if (stack.length > MAX_HISTORY) stack.shift();
        undoStack.set(activeFile.id, stack);
        redoStack.delete(activeFile.id);
        setCanUndo(true);
        setCanRedo(false);
      }
      lastContentRef.set(activeFile.id, text);

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

    const result = await saveFileAs(activeFile.content, activeFile.name);
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

  const handleUndo = useCallback(() => {
    if (!activeFile) return;

    const stack = undoStack.get(activeFile.id);
    if (!stack || stack.length === 0) return;

    const currentContent = activeFile.content;
    const redoStackForFile = redoStack.get(activeFile.id) ?? [];
    redoStackForFile.push(currentContent);
    redoStack.set(activeFile.id, redoStackForFile);

    const prevContent = stack.pop()!;
    if (stack.length === 0) {
      undoStack.delete(activeFile.id);
    }

    lastContentRef.set(activeFile.id, prevContent);
    updateFile(activeFile.id, { content: prevContent, isModified: true });
    saveFileContent(activeFile.id, prevContent);

    setCanUndo(stack.length > 0);
    setCanRedo(true);
  }, [activeFile, updateFile]);

  const handleRedo = useCallback(() => {
    if (!activeFile) return;

    const stack = redoStack.get(activeFile.id);
    if (!stack || stack.length === 0) return;

    const currentContent = activeFile.content;
    const undoStackForFile = undoStack.get(activeFile.id) ?? [];
    undoStackForFile.push(currentContent);
    undoStack.set(activeFile.id, undoStackForFile);

    const nextContent = stack.pop()!;
    if (stack.length === 0) {
      redoStack.delete(activeFile.id);
    }

    lastContentRef.set(activeFile.id, nextContent);
    updateFile(activeFile.id, { content: nextContent, isModified: true });
    saveFileContent(activeFile.id, nextContent);

    setCanUndo(true);
    setCanRedo(stack.length > 0);
  }, [activeFile, updateFile]);

  return {
    activeFile,
    activeFileId,
    files,
    canUndo,
    canRedo,
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
