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
  lineHeight: number;
  onSelectionChange: (line: number) => void;
  onChangeText: (text: string) => void;
}

export const useEditorLayout = ({
  normalizedContent,
  wordWrap,
  activeLine,
  lineHeight,
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

  const { highlightTop, currentLineHeight } = useMemo(() => {
    if (!wordWrap || visualLines.length === 0) {
      return {
        highlightTop: (Math.max(activeLine, 1) - 1) * lineHeight,
        currentLineHeight: lineHeight,
      };
    }

    let matchedRow = -1;
    for (let i = 0; i < visualLines.length; i++) {
      const vl = visualLines[i];
      if (!vl) continue;
      if (cursorOffset >= vl.start && cursorOffset < vl.end) {
        matchedRow = i;
        break;
      }
    }

    if (matchedRow === -1 && visualLines.length > 0) {
      const last = visualLines[visualLines.length - 1];
      if (last) {
        let maxLogical = 1;
        for (let i = visualLines.length - 1; i >= 0; i--) {
          const lbl = visualLines[i]?.label;
          if (lbl) {
            const num = parseInt(lbl, 10);
            if (!isNaN(num)) {
              maxLogical = num;
              break;
            }
          }
        }
        const lineDiff = Math.max(activeLine - maxLogical, 0);
        if (lineDiff > 0) {
          const defaultH = last.height ?? lineHeight;
          return {
            highlightTop: (last.y ?? 0) + defaultH * lineDiff,
            currentLineHeight: defaultH,
          };
        }
        matchedRow = visualLines.length - 1;
      }
    }

    if (matchedRow !== -1 && visualLines[matchedRow]) {
      const vl = visualLines[matchedRow]!;
      return {
        highlightTop: vl.y ?? matchedRow * lineHeight,
        currentLineHeight: vl.height ?? lineHeight,
      };
    }

    return {
      highlightTop: (Math.max(activeLine, 1) - 1) * lineHeight,
      currentLineHeight: lineHeight,
    };
  }, [wordWrap, visualLines, activeLine, cursorOffset, lineHeight]);

  return {
    visualLines,
    highlightTop,
    currentLineHeight,
    handleTextLayout,
    handleSelectionChange,
    handleChangeText,
  };
};
