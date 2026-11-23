import { Linking } from "react-native";

export interface TextSegment {
  text: string;
  isLink: boolean;
  url?: string;
  start: number;
  end: number;
}

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;
const TRAILING_PUNCT_REGEX = /[.,;:!?\]}'"]+$/;

const trimTrailingPunctuation = (raw: string): string => {
  let result = raw.replace(TRAILING_PUNCT_REGEX, "");

  while (result.endsWith(")")) {
    const openCount = (result.match(/\(/g) ?? []).length;
    const closeCount = (result.match(/\)/g) ?? []).length;
    if (closeCount > openCount) {
      result = result.slice(0, -1).replace(TRAILING_PUNCT_REGEX, "");
    } else {
      break;
    }
  }

  return result;
};

export const normalizeUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const hasDetectedLinks = (text: string): boolean => {
  URL_PATTERN.lastIndex = 0;
  return URL_PATTERN.test(text);
};

export const splitTextWithLinks = (text: string): TextSegment[] => {
  if (!text) return [];

  const segments: TextSegment[] = [];
  URL_PATTERN.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = URL_PATTERN.exec(text)) !== null) {
    const rawMatch = match[0];
    const matchStart = match.index;
    const cleaned = trimTrailingPunctuation(rawMatch);

    if (!cleaned) continue;

    if (matchStart > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, matchStart),
        isLink: false,
        start: lastIndex,
        end: matchStart,
      });
    }

    const linkEnd = matchStart + cleaned.length;
    segments.push({
      text: cleaned,
      isLink: true,
      url: normalizeUrl(cleaned),
      start: matchStart,
      end: linkEnd,
    });

    lastIndex = linkEnd;
    if (URL_PATTERN.lastIndex > linkEnd) {
      URL_PATTERN.lastIndex = linkEnd;
    }
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isLink: false,
      start: lastIndex,
      end: text.length,
    });
  }

  return segments;
};

export const findLinkAtOffset = (
  text: string,
  offset: number,
): string | null => {
  if (!text || offset < 0) return null;
  const segments = splitTextWithLinks(text);
  for (const seg of segments) {
    if (seg.isLink && seg.url && offset >= seg.start && offset <= seg.end) {
      return seg.url;
    }
  }
  return null;
};

export const formatLinkLabel = (url: string): string => {
  const clean = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (clean.length <= 34) return clean;
  return `${clean.slice(0, 33)}…`;
};

export const openUrlInBrowser = async (rawUrl: string): Promise<void> => {
  try {
    const target = normalizeUrl(rawUrl);
    await Linking.openURL(target);
  } catch {
    // ignore invalid or unopenable URLs
  }
};
