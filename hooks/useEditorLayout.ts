import {
  getEstimatedCursor,
  getLineFromOffset,
  parseVisualLines,
  type TextLayoutLine,
  type VisualLineInfo,
} from "@/lib/editorHelpers";
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  NativeSyntheticEvent,
  TextInputSelectionChangeEvent,
} from "react-native";

type TextLayoutEvent = NativeSyntheticEvent<{ lines: TextLayoutLine[] }>;

interface UseEditorLayoutProps {
  normalizedContent: string;
  wordWrap: boolean;
  activeLine: number;
  onSelectionChange: (line: number) => void;
  onChangeText: (text: string) => void;
}

export const useEditorLayout = ({
  normalizedContent,
  wordWrap,
  activeLine,
  onSelectionChange,
  onChangeText,
}: UseEditorLayoutProps) => {
  const contentRef = useRef(normalizedContent);
  contentRef.current = normalizedContent;

  const [cursorOffset, setCursorOffset] = useState(0);
  const [visualLines, setVisualLines] = useState<VisualLineInfo[]>([]);

  const handleTextLayout = useCallback(
    (e: TextLayoutEvent) => {
      const nLines = e.nativeEvent.lines;
      if (nLines && nLines.length > 0) {
        setVisualLines(parseVisualLines(nLines, contentRef.current));
      }
    },
    [],
  );

  const handleSelectionChange = useCallback(
    (e: TextInputSelectionChangeEvent) => {
      const { start } = e.nativeEvent.selection;
      setCursorOffset(start);
      const line = getLineFromOffset(contentRef.current, start);
      onSelectionChange(line);
    },
    [onSelectionChange],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const cursor = getEstimatedCursor(contentRef.current, normalized);
      contentRef.current = normalized;
      setCursorOffset(cursor);
      const line = getLineFromOffset(normalized, cursor);
      onSelectionChange(line);
      onChangeText(normalized);
    },
    [onChangeText, onSelectionChange],
  );

  const activeVisualRow = useMemo(() => {
    if (!wordWrap || visualLines.length === 0) {
      return Math.max(activeLine, 1) - 1;
    }
    const targetLabel = String(activeLine);
    let startRow = -1;
    for (let i = 0; i < visualLines.length; i++) {
      if (visualLines[i]?.label === targetLabel) {
        startRow = i;
        break;
      }
    }
    if (startRow === -1) {
      return Math.max(activeLine, 1) - 1;
    }
    let matchedRow = startRow;
    for (let i = startRow + 1; i < visualLines.length; i++) {
      const vl = visualLines[i];
      if (!vl || vl.label !== "") break;
      if (cursorOffset >= vl.start) {
        matchedRow = i;
      }
    }
    return matchedRow;
  }, [wordWrap, visualLines, activeLine, cursorOffset]);

  return {
    visualLines,
    activeVisualRow,
    handleTextLayout,
    handleSelectionChange,
    handleChangeText,
  };
};
