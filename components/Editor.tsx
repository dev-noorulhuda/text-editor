import { colors } from "@/lib/colors";
import { resolveFontFamily } from "@/lib/fontHelpers";
import type { EditorProps } from "@/types/editorTypes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TextInputSelectionChangeEvent } from "react-native";
import { ScrollView, Text, TextInput, View } from "react-native";

const LINE_HEIGHT_RATIO = 1.5;
const BASE_EDGE_SPACING = 14;
const CONTENT_PADDING_TOP = 12;
const HIGHLIGHT_VERTICAL_ADJUST = 2;

const getLineFromOffset = (text: string, offset: number): number => {
  const safeOffset = Math.max(0, Math.min(offset, text.length));
  let line = 1;
  for (let i = 0; i < safeOffset; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
    }
  }
  return line;
};

export const Editor = ({
  content,
  isDark,
  editable,
  fontSize,
  fontFamily = "system",
  edgeSpacing,
  highlightLine,
  showLineNumbers,
  wordWrap = false,
  currentLine,
  autoFocus,
  onChangeText,
  onSelectionChange,
}: EditorProps) => {
  const lineHeight = Math.round(fontSize * LINE_HEIGHT_RATIO);
  const inputRef = useRef<TextInput>(null);
  const [activeLine, setActiveLine] = useState(currentLine);
  const [prevCurrentLine, setPrevCurrentLine] = useState(currentLine);

  if (currentLine !== prevCurrentLine) {
    setPrevCurrentLine(currentLine);
    setActiveLine(currentLine);
  }

  const normalizedContent = useMemo(
    () => content.replace(/\r\n/g, "\n").replace(/\r/g, "\n"),
    [content],
  );

  useEffect(() => {
    if (!autoFocus || !editable) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [autoFocus, editable]);

  const lines = useMemo(() => {
    const split = normalizedContent.split("\n");
    if (split.length === 1 && split[0] === "") return [""];
    return split;
  }, [normalizedContent]);

  const gutterWidth = useMemo(() => {
    const digitCount = Math.max(String(lines.length).length, 2);
    const charWidth = Math.max(Math.ceil(fontSize * 0.75), 10);
    return digitCount * charWidth + 24;
  }, [lines.length, fontSize]);

  const maxLineLength = useMemo(() => {
    let max = 0;
    for (let i = 0; i < lines.length; i++) {
      const len = lines[i]?.length ?? 0;
      if (len > max) max = len;
    }
    return max;
  }, [lines]);

  const charWidth = Math.max(Math.ceil(fontSize * 0.7), 10);
  const estimatedWidth = maxLineLength * charWidth + 60;
  const canvasWidth = wordWrap
    ? "100%"
    : estimatedWidth > 0
      ? Math.max(estimatedWidth, 100)
      : "100%";

  const handleSelectionChange = useCallback(
    (e: TextInputSelectionChangeEvent) => {
      const { start } = e.nativeEvent.selection;
      const line = getLineFromOffset(normalizedContent, start);
      setActiveLine(line);
      onSelectionChange(line);
    },
    [normalizedContent, onSelectionChange],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const prev = normalizedContent;
      let diffStart = 0;
      const minLen = Math.min(prev.length, normalized.length);
      while (
        diffStart < minLen &&
        prev.charCodeAt(diffStart) === normalized.charCodeAt(diffStart)
      ) {
        diffStart++;
      }
      const delta = normalized.length - prev.length;
      const cursor = delta > 0 ? diffStart + delta : diffStart;
      const line = getLineFromOffset(normalized, cursor);
      setActiveLine(line);
      onSelectionChange(line);
      onChangeText(normalized);
    },
    [normalizedContent, onChangeText, onSelectionChange],
  );

  const clampedLine = Math.min(Math.max(activeLine, 1), lines.length);
  const highlightTop = useMemo(
    () => (clampedLine - 1) * lineHeight,
    [clampedLine, lineHeight],
  );

  const lineHighlightBg = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.04)";

  const gutterColor = isDark ? colors.dark[300] : colors.white[500];
  const resolvedFont = resolveFontFamily(fontFamily);
  const totalHeight = Math.max(lines.length * lineHeight + 24, 200);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ minHeight: "100%" }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
    >
      <View style={{ flexDirection: "row", minHeight: totalHeight }}>
        {showLineNumbers && (
          <View
            style={{
              width: gutterWidth,
              backgroundColor: "transparent",
              paddingTop: CONTENT_PADDING_TOP,
              paddingBottom: 12,
              paddingLeft: 8,
              paddingRight: 8,
              marginLeft: edgeSpacing ?? 0,
              alignItems: "flex-end",
            }}
          >
            {lines.map((_, i) => (
              <Text
                key={i}
                numberOfLines={1}
                style={{
                  fontSize: fontSize - 2,
                  height: lineHeight,
                  lineHeight,
                  color: gutterColor,
                  fontWeight: "400",
                  textAlign: "right",
                  width: "100%",
                  fontFamily: resolvedFont,
                  includeFontPadding: false,
                }}
              >
                {i + 1}
              </Text>
            ))}
          </View>
        )}

        <ScrollView
          horizontal
          scrollEnabled={!wordWrap}
          showsHorizontalScrollIndicator={false}
          className="flex-1"
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              minWidth: "100%",
              width: canvasWidth,
              minHeight: totalHeight,
              position: "relative",
            }}
          >
            {highlightLine && (
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top:
                    highlightTop +
                    CONTENT_PADDING_TOP +
                    HIGHLIGHT_VERTICAL_ADJUST,
                  height: lineHeight,
                  backgroundColor: lineHighlightBg,
                  pointerEvents: "none",
                }}
              />
            )}
            <TextInput
              key={resolvedFont}
              ref={inputRef}
              style={{
                fontSize,
                lineHeight,
                fontFamily: resolvedFont,
                includeFontPadding: false,
                paddingLeft: showLineNumbers
                  ? 8
                  : BASE_EDGE_SPACING + (edgeSpacing ?? 0),
                paddingRight: BASE_EDGE_SPACING + (edgeSpacing ?? 0),
                paddingTop: CONTENT_PADDING_TOP,
                paddingBottom: 12,
                backgroundColor: "transparent",
                color: isDark ? colors.dark[50] : colors.white[900],
                minHeight: totalHeight,
                width: "100%",
              }}
              multiline
              scrollEnabled={false}
              value={normalizedContent}
              onChangeText={handleChangeText}
              onSelectionChange={handleSelectionChange}
              placeholder="Start typing..."
              placeholderTextColor={
                isDark ? colors.dark[300] : colors.white[500]
              }
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
              editable={editable}
            />
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};
