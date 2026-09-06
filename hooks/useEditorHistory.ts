import type { FileData } from "@/types/editorTypes";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_HISTORY = 100;

export const useEditorHistory = (
  activeFile: FileData | undefined,
  updateFile: (id: string, updates: Partial<FileData>) => void,
  saveFileContent: (id: string, content: string) => void,
) => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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
      if (!lastContentRef.has(activeFile.id)) {
        lastContentRef.set(activeFile.id, activeFile.content);
      }
      setCanUndo((undoStack.get(activeFile.id)?.length ?? 0) > 0);
      setCanRedo((redoStack.get(activeFile.id)?.length ?? 0) > 0);
    } else {
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [activeFile, undoStack, redoStack, lastContentRef]);

  const recordChange = useCallback(
    (text: string) => {
      if (!activeFile) return;

      const lastContent =
        lastContentRef.get(activeFile.id) ?? activeFile.content;
      if (lastContent !== text) {
        const stack = undoStack.get(activeFile.id) ?? [];
        stack.push(lastContent);
        if (stack.length > MAX_HISTORY) stack.shift();
        undoStack.set(activeFile.id, stack);
        redoStack.delete(activeFile.id);
        setCanUndo(true);
        setCanRedo(false);
      }
      lastContentRef.set(activeFile.id, text);
    },
    [activeFile, undoStack, redoStack, lastContentRef],
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
  }, [
    activeFile,
    updateFile,
    saveFileContent,
    undoStack,
    redoStack,
    lastContentRef,
  ]);

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
  }, [
    activeFile,
    updateFile,
    saveFileContent,
    undoStack,
    redoStack,
    lastContentRef,
  ]);

  return {
    canUndo,
    canRedo,
    recordChange,
    handleUndo,
    handleRedo,
  };
};
