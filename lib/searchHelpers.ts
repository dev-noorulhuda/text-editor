import type { TextSegment } from "@/lib/linkHelpers";

export interface SearchMatch {
  start: number;
  end: number;
  line: number;
}

export interface SearchOptions {
  caseSensitive: boolean;
}

export type MatchHighlightType = "none" | "match" | "active";

export interface StyledTextRun {
  text: string;
  isLink: boolean;
  url?: string;
  matchType: MatchHighlightType;
}

export const findAllMatches = (
  content: string,
  query: string,
  options: SearchOptions,
): SearchMatch[] => {
  if (!query || !content) return [];

  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const haystack = options.caseSensitive
    ? normalized
    : normalized.toLowerCase();
  const needle = options.caseSensitive ? query : query.toLowerCase();
  const needleLen = needle.length;
  if (needleLen === 0) return [];

  const matches: SearchMatch[] = [];
  let line = 1;
  let lineCursor = 0;
  let searchPos = 0;

  while (searchPos <= haystack.length - needleLen) {
    const idx = haystack.indexOf(needle, searchPos);
    if (idx === -1) break;

    for (let i = lineCursor; i < idx; i++) {
      if (normalized.charCodeAt(i) === 10) line++;
    }
    lineCursor = idx;

    matches.push({ start: idx, end: idx + needleLen, line });
    searchPos = idx + needleLen;
  }

  return matches;
};

export const replaceMatchAt = (
  content: string,
  match: SearchMatch,
  replacement: string,
): string => {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return (
    normalized.slice(0, match.start) + replacement + normalized.slice(match.end)
  );
};

export const replaceAllMatches = (
  content: string,
  query: string,
  replacement: string,
  options: SearchOptions,
): { nextContent: string; count: number } => {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const matches = findAllMatches(normalized, query, options);
  if (matches.length === 0) {
    return { nextContent: normalized, count: 0 };
  }

  let out = "";
  let cursor = 0;
  for (const m of matches) {
    out += normalized.slice(cursor, m.start) + replacement;
    cursor = m.end;
  }
  out += normalized.slice(cursor);

  return { nextContent: out, count: matches.length };
};

export const mergeSegmentsWithMatches = (
  segments: TextSegment[],
  matches: SearchMatch[],
  activeMatchIndex: number,
): StyledTextRun[] => {
  if (matches.length === 0) {
    return segments.map((s) => ({
      text: s.text,
      isLink: s.isLink,
      url: s.url,
      matchType: "none",
    }));
  }

  const runs: StyledTextRun[] = [];
  let matchIdx = 0;

  for (const seg of segments) {
    let pos = seg.start;

    while (matchIdx < matches.length && matches[matchIdx]!.end <= seg.start) {
      matchIdx++;
    }

    let localMatchIdx = matchIdx;
    while (pos < seg.end && localMatchIdx < matches.length) {
      const m = matches[localMatchIdx]!;
      if (m.start >= seg.end) break;

      if (m.start > pos) {
        runs.push({
          text: seg.text.slice(pos - seg.start, m.start - seg.start),
          isLink: seg.isLink,
          url: seg.url,
          matchType: "none",
        });
        pos = m.start;
      }

      const overlapEnd = Math.min(m.end, seg.end);
      if (overlapEnd > pos) {
        runs.push({
          text: seg.text.slice(pos - seg.start, overlapEnd - seg.start),
          isLink: seg.isLink,
          url: seg.url,
          matchType: localMatchIdx === activeMatchIndex ? "active" : "match",
        });
        pos = overlapEnd;
      }

      if (m.end <= seg.end) {
        localMatchIdx++;
      } else {
        break;
      }
    }

    if (pos < seg.end) {
      runs.push({
        text: seg.text.slice(pos - seg.start),
        isLink: seg.isLink,
        url: seg.url,
        matchType: "none",
      });
    }
  }

  return runs;
};
