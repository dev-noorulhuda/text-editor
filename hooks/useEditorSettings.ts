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
  const [edgeSpacing, setEdgeSpacing] = useState(saved.current.edgeSpacing);
  const [openKeyboardAtStart, setOpenKeyboardAtStart] = useState(
    saved.current.openKeyboardAtStart,
  );

  useEffect(() => {
    saveSettings({
      colorScheme,
      isEditable,
      fontSize,
      fontFamily,
      highlightLine,
      showLineNumbers,
      edgeSpacing,
      openKeyboardAtStart,
    });
  }, [
    colorScheme,
    isEditable,
    fontSize,
    fontFamily,
    highlightLine,
    showLineNumbers,
    edgeSpacing,
    openKeyboardAtStart,
  ]);

  useFocusEffect(
    useCallback(() => {
      const fresh = loadSettings();
      setHighlightLine(fresh.highlightLine);
      setShowLineNumbers(fresh.showLineNumbers);
      setFontSize(fresh.fontSize);
      setFontFamily(fresh.fontFamily ?? "system");
      setEdgeSpacing(fresh.edgeSpacing);
      setOpenKeyboardAtStart(fresh.openKeyboardAtStart);
    }, []),
  );

  return {
    isEditable,
    fontSize,
    fontFamily,
    colorScheme,
    highlightLine,
    showLineNumbers,
    edgeSpacing,
    openKeyboardAtStart,
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
