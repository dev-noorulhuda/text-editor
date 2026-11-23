import {
  findAllMatches,
  replaceAllMatches,
  replaceMatchAt,
} from "@/lib/searchHelpers";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseFindReplaceOptions {
  content: string;
  isEditable: boolean;
  onContentChange: (next: string) => void;
  onJumpToLine: (line: number) => void;
  onReadOnlyNotice: () => void;
  onNotify: (message: string) => void;
}

export const useFindReplace = ({
  content,
  isEditable,
  onContentChange,
  onJumpToLine,
  onReadOnlyNotice,
  onNotify,
}: UseFindReplaceOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [rawIndex, setRawIndex] = useState(0);

  const matches = useMemo(
    () => (isOpen ? findAllMatches(content, query, { caseSensitive }) : []),
    [isOpen, content, query, caseSensitive],
  );

  const activeIndex =
    matches.length === 0 ? -1 : Math.min(rawIndex, matches.length - 1);
  const activeMatch = activeIndex >= 0 ? (matches[activeIndex] ?? null) : null;

  useEffect(() => {
    if (isOpen && activeMatch) {
      onJumpToLine(activeMatch.line);
    }
  }, [isOpen, activeMatch, onJumpToLine]);

  const toggleFind = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeFind = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleReplace = useCallback(() => {
    setShowReplace((prev) => !prev);
  }, []);

  const toggleCaseSensitive = useCallback(() => {
    setCaseSensitive((prev) => !prev);
    setRawIndex(0);
  }, []);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    setRawIndex(0);
  }, []);

  const nextMatch = useCallback(() => {
    if (matches.length === 0) return;
    setRawIndex((prev) => (prev + 1) % matches.length);
  }, [matches.length]);

  const prevMatch = useCallback(() => {
    if (matches.length === 0) return;
    setRawIndex((prev) => (prev - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const handleReplace = useCallback(() => {
    if (!isEditable) {
      onReadOnlyNotice();
      return;
    }
    if (!activeMatch) return;
    const nextContent = replaceMatchAt(content, activeMatch, replacement);
    onContentChange(nextContent);
  }, [isEditable, activeMatch, content, replacement, onContentChange, onReadOnlyNotice]);

  const handleReplaceAll = useCallback(() => {
    if (!isEditable) {
      onReadOnlyNotice();
      return;
    }
    if (!query || matches.length === 0) return;
    const { nextContent, count } = replaceAllMatches(
      content,
      query,
      replacement,
      { caseSensitive },
    );
    if (count > 0) {
      onContentChange(nextContent);
      onNotify(`Replaced ${count} ${count === 1 ? "match" : "matches"}`);
    }
  }, [
    isEditable,
    query,
    matches.length,
    content,
    replacement,
    caseSensitive,
    onContentChange,
    onReadOnlyNotice,
    onNotify,
  ]);

  return {
    isOpen,
    showReplace,
    query,
    replacement,
    caseSensitive,
    matches,
    activeIndex,
    toggleFind,
    closeFind,
    toggleReplace,
    toggleCaseSensitive,
    setQuery: handleQueryChange,
    setReplacement,
    nextMatch,
    prevMatch,
    handleReplace,
    handleReplaceAll,
  };
};
