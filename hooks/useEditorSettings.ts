import {
  loadSettings,
  saveSettings,
  type FontFamily,
} from "@/lib/settingsStore";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

export const useEditorSettings = () => {
  const saved = useRef(loadSettings());

  const [isEditable, setIsEditable] = useState(saved.current.isEditable);
  const [fontSize, setFontSize] = useState(saved.current.fontSize);
  const [fontFamily, setFontFamily] = useState<FontFamily>(
    saved.current.fontFamily ?? "system",
  );
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    saved.current.colorScheme,
  );
  const [highlightLine, setHighlightLine] = useState(
    saved.current.highlightLine,
  );
  const [showLineNumbers, setShowLineNumbers] = useState(
    saved.current.showLineNumbers,
  );
  const [wordWrap, setWordWrap] = useState(saved.current.wordWrap ?? false);
  const [edgeSpacing, setEdgeSpacing] = useState(saved.current.edgeSpacing);
  const [openKeyboardAtStart, setOpenKeyboardAtStart] = useState(
    saved.current.openKeyboardAtStart,
  );
  const [clearSessionOnRestart, setClearSessionOnRestart] = useState(
    saved.current.clearSessionOnRestart ?? false,
  );

  useEffect(() => {
    saveSettings({
      colorScheme,
      isEditable,
      fontSize,
      fontFamily,
      highlightLine,
      showLineNumbers,
      wordWrap,
      edgeSpacing,
      openKeyboardAtStart,
      clearSessionOnRestart,
    });
  }, [
    colorScheme,
    isEditable,
    fontSize,
    fontFamily,
    highlightLine,
    showLineNumbers,
    wordWrap,
    edgeSpacing,
    openKeyboardAtStart,
    clearSessionOnRestart,
  ]);

  useFocusEffect(
    useCallback(() => {
      const fresh = loadSettings();
      setHighlightLine(fresh.highlightLine);
      setShowLineNumbers(fresh.showLineNumbers);
      setWordWrap(fresh.wordWrap ?? false);
      setFontSize(fresh.fontSize);
      setFontFamily(fresh.fontFamily ?? "system");
      setEdgeSpacing(fresh.edgeSpacing);
      setOpenKeyboardAtStart(fresh.openKeyboardAtStart);
      setClearSessionOnRestart(fresh.clearSessionOnRestart ?? false);
    }, []),
  );

  return {
    isEditable,
    fontSize,
    fontFamily,
    colorScheme,
    highlightLine,
    showLineNumbers,
    wordWrap,
    edgeSpacing,
    openKeyboardAtStart,
    clearSessionOnRestart,
    toggleEditable: useCallback(() => setIsEditable((prev) => !prev), []),
    increaseFontSize: useCallback(
      () => setFontSize((prev) => Math.min(prev + 2, 40)),
      [],
    ),
    decreaseFontSize: useCallback(
      () => setFontSize((prev) => Math.max(prev - 2, 10)),
      [],
    ),
    toggleColorScheme: useCallback(
      () => setColorScheme((prev) => (prev === "dark" ? "light" : "dark")),
      [],
    ),
    toggleHighlightLine: useCallback(
      () => setHighlightLine((prev) => !prev),
      [],
    ),
    toggleShowLineNumbers: useCallback(
      () => setShowLineNumbers((prev) => !prev),
      [],
    ),
    toggleWordWrap: useCallback(() => setWordWrap((prev) => !prev), []),
    increaseEdgeSpacing: useCallback(
      () => setEdgeSpacing((prev) => Math.min(prev + 2, 40)),
      [],
    ),
    decreaseEdgeSpacing: useCallback(
      () => setEdgeSpacing((prev) => Math.max(prev - 2, 0)),
      [],
    ),
  };
};
