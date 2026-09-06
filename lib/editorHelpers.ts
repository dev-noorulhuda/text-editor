export interface TextLayoutLine {
  text: string;
}

export const LINE_HEIGHT_RATIO = 1.2;
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
    const len = line.text.length;
    const isStart = i === 0 || content[charIdx - 1] === "\n";
    parsed.push({
      label: isStart ? String(logLine) : "",
      start: charIdx,
      end: charIdx + len,
    });
    if (isStart) logLine++;
    charIdx += len;
  }
  return parsed;
};
