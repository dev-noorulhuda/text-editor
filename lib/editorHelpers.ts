export interface TextLayoutLine {
  text: string;
  y?: number;
  height?: number;
}

export const LINE_HEIGHT_RATIO = 1.4;
export const BASE_EDGE_SPACING = 14;
export const CONTENT_PADDING_TOP = 12;

export const getLineFromOffset = (text: string, offset: number): number => {
  const safeOffset = Math.max(0, Math.min(offset, text.length));
  let line = 1;
  for (let i = 0; i < safeOffset; i++) {
    if (text.charCodeAt(i) === 10) line++;
  }
  return line;
};

export const getEstimatedCursor = (prev: string, next: string): number => {
  let diffStart = 0;
  const minLen = Math.min(prev.length, next.length);
  while (
    diffStart < minLen &&
    prev.charCodeAt(diffStart) === next.charCodeAt(diffStart)
  ) {
    diffStart++;
  }
  const delta = next.length - prev.length;
  return delta > 0 ? diffStart + delta : diffStart;
};

export interface VisualLineInfo {
  label: string;
  start: number;
  end: number;
  y?: number;
  height?: number;
}

export const parseVisualLines = (
  nativeLines: TextLayoutLine[],
  content: string,
): VisualLineInfo[] => {
  if (nativeLines.length === 0) return [];
  let logLine = 1;
  let charIdx = 0;
  const parsed: VisualLineInfo[] = [];

  for (let i = 0; i < nativeLines.length; i++) {
    const line = nativeLines[i];
    if (!line) continue;

    const prevText = i > 0 ? nativeLines[i - 1]?.text || "" : "";
    const isStart =
      i === 0 || prevText.endsWith("\n") || prevText.endsWith("\r");

    const lineText = line.text || "";
    const start = charIdx;
    charIdx += lineText.length;

    parsed.push({
      label: isStart ? String(logLine++) : "",
      start,
      end: charIdx,
      y: line.y,
      height: line.height,
    });
  }

  const totalLogicalLines = content.split("\n").length;
  while (parsed.length < totalLogicalLines) {
    const lastParsed = parsed[parsed.length - 1];
    const defaultHeight = lastParsed?.height ?? 24;
    const lastY = (lastParsed?.y ?? 0) + (lastParsed ? defaultHeight : 0);
    parsed.push({
      label: String(logLine++),
      start: charIdx,
      end: charIdx,
      y: lastY,
      height: defaultHeight,
    });
  }

  return parsed;
};
