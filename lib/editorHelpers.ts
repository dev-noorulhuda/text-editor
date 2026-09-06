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
  let logLine = 1;
  let charIdx = 0;
  const parsed: VisualLineInfo[] = [];

  for (let i = 0; i < nativeLines.length; i++) {
    const line = nativeLines[i];
    if (!line) continue;

    const isStart =
      charIdx === 0 || (charIdx > 0 && content[charIdx - 1] === "\n");
    const lineText = line.text || "";
    const start = charIdx;
    let end = start + lineText.length;

    charIdx = end;

    if (charIdx < content.length && content[charIdx] === "\n") {
      charIdx++;
    } else if (
      charIdx < content.length &&
      content[charIdx] === "\r" &&
      content[charIdx + 1] === "\n"
    ) {
      charIdx += 2;
    } else if (
      charIdx < content.length &&
      content[charIdx] === " " &&
      i < nativeLines.length - 1
    ) {
      const nextText = nativeLines[i + 1]?.text || "";
      if (nextText && content.slice(charIdx).startsWith(" " + nextText)) {
        charIdx++;
      }
    }

    parsed.push({
      label: isStart ? String(logLine) : "",
      start,
      end: charIdx,
      y: line.y,
      height: line.height,
    });

    if (isStart) logLine++;
  }

  const totalLogicalLines = content.split("\n").length;
  while (parsed.length < totalLogicalLines) {
    const lastParsed = parsed[parsed.length - 1];
    const defaultLineHeight = lastParsed?.height ?? 24;
    const lastY = (lastParsed?.y ?? 0) + (lastParsed ? defaultLineHeight : 0);
    parsed.push({
      label: String(logLine),
      start: content.length,
      end: content.length,
      y: lastY,
      height: defaultLineHeight,
    });
    logLine++;
  }

  return parsed;
};
