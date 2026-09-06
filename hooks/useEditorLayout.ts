import {
  getEstimatedCursor,
  getLineFromOffset,
  parseVisualLines,
  type TextLayoutLine,
  type VisualLineInfo,
} from "@/lib/editorHelpers";
import { useCallback, useMemo, useState } from "react";
import type {
  NativeSyntheticEvent,
  TextInputSelectionChangeEvent,
} from "react-native";

type TextLayoutEvent = NativeSyntheticEvent<{ lines: TextLayoutLine[] }>;

interface UseEditorLayoutProps {
  normalizedContent: string;
  wordWrap: boolean;
  lines: string[];
  activeLine: number;
  onSelectionChange: (line: number) => void;
  onChangeText: (text: string) => void;
}

export const useEditorLayout = ({
  normalizedContent,
  wordWrap,
  lines,
  activeLine,
  onSelectionChange,
  onChangeText,
}: UseEditorLayoutProps) => {
  const [cursorOffset, setCursorOffset] = useState(0);
  const [visualLines, setVisualLines] = useState<VisualLineInfo[]>([]);

  const handleTextLayout = useCallback(
    (e: TextLayoutEvent) => {
      const nLines = e.nativeEvent.lines;
      if (nLines && nLines.length > 0) {
        setVisualLines(parseVisualLines(nLines, normalizedContent));
      }
    },
    [normalizedContent],
  );

  const handleSelectionChange = useCallback(
    (e: TextInputSelectionChangeEvent) => {
      const { start } = e.nativeEvent.selection;
      setCursorOffset(start);
      const line = getLineFromOffset(normalizedContent, start);
      onSelectionChange(line);
    },
    [normalizedContent, onSelectionChange],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const cursor = getEstimatedCursor(normalizedContent, normalized);
      setCursorOffset(cursor);
      const line = getLineFromOffset(normalized, cursor);
      onSelectionChange(line);
      onChangeText(normalized);
    },
    [normalizedContent, onChangeText, onSelectionChange],
  );

  const activeVisualRow = useMemo(() => {
    if (!wordWrap || visualLines.length === 0) {
      return Math.min(Math.max(activeLine, 1), lines.length) - 1;
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
      return Math.min(Math.max(activeLine, 1), lines.length) - 1;
    }
    let matchedRow = startRow;
    for (let i = startRow; i < visualLines.length; i++) {
      const vl = visualLines[i];
      if (!vl) break;
      if (i > startRow && vl.label !== "") break;
      if (cursorOffset >= vl.start) {
        matchedRow = i;
      }
    }
    return matchedRow;
  }, [wordWrap, visualLines, activeLine, lines.length, cursorOffset]);

  return {
    visualLines,
    activeVisualRow,
    handleTextLayout,
    handleSelectionChange,
    handleChangeText,
  };
};
