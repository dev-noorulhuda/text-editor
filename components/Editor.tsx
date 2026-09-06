import { EditorCanvas } from "@/components/EditorCanvas";
import { EditorGutter } from "@/components/EditorGutter";
import { useEditorLayout } from "@/hooks/useEditorLayout";
import { useEditorScroll } from "@/hooks/useEditorScroll";
import { colors } from "@/lib/colors";
import {
  CONTENT_PADDING_TOP,
  LINE_HEIGHT_RATIO,
} from "@/lib/editorHelpers";
import { resolveFontFamily } from "@/lib/fontHelpers";
import type { EditorProps } from "@/types/editorTypes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  onReadOnlyNotice,
}: EditorProps) => {
  const lineHeight = Math.round(fontSize * LINE_HEIGHT_RATIO);
  const inputRef = useRef<TextInput>(null);
  const [activeLine, setActiveLine] = useState(currentLine);

  if (currentLine !== activeLine) {
    setActiveLine(currentLine);
  }

  const normalizedContent = useMemo(
    () => content.replace(/\r\n/g, "\n").replace(/\r/g, "\n"),
    [content],
  );

  useEffect(() => {
    if (!autoFocus || !editable) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [autoFocus, editable]);

  const lines = useMemo(
    () => normalizedContent.split("\n"),
    [normalizedContent],
  );

  const handleSelection = (line: number) => {
    setActiveLine(line);
    onSelectionChange(line);
  };

  const {
    visualLines,
    highlightTop,
    currentLineHeight,
    handleTextLayout,
    handleSelectionChange,
    handleChangeText,
  } = useEditorLayout({
    normalizedContent,
    wordWrap,
    activeLine,
    lineHeight,
    onSelectionChange: handleSelection,
    onChangeText,
  });

  const {
    scrollViewRef,
    keyboardHeight,
    viewportHeight,
    viewportWidth,
    handleScroll,
    handleLayout,
  } = useEditorScroll({
    highlightTop,
    currentLineHeight,
  });

  const gutterWidth = useMemo(() => {
    const digitCount = Math.max(String(lines.length).length, 1);
    const charWidth = Math.max(Math.ceil((fontSize - 2) * 0.65), 7);
    return digitCount * charWidth + 14;
  }, [lines.length, fontSize]);

  const maxLineLength = useMemo(
    () => lines.reduce((max, l) => Math.max(max, l.length), 0),
    [lines],
  );

  const estimatedWidth =
    maxLineLength * Math.max(Math.ceil(fontSize * 0.7), 10) + 60;
  const canvasWidth = wordWrap
    ? "100%"
    : Math.max(estimatedWidth, viewportWidth);

  const gutterColor = isDark ? colors.dark[300] : colors.white[500];
  const resolvedFont = resolveFontFamily(fontFamily);

  const rowCount = Math.max(
    wordWrap && visualLines.length > 0 ? visualLines.length : 0,
    lines.length,
  );
  const totalHeight = Math.max(rowCount * lineHeight + 24, viewportHeight);
  const padLeft = showLineNumbers ? 6 : 0;

  const focusInput = useCallback(() => {
    if (editable) inputRef.current?.focus();
  }, [editable]);

  const canvasElement = (
    <EditorCanvas
      ref={inputRef}
      editable={editable}
      fontSize={fontSize}
      lineHeight={lineHeight}
      resolvedFont={resolvedFont}
      isDark={isDark}
      padLeft={padLeft}
      wordWrap={wordWrap}
      canvasWidth={canvasWidth}
      totalHeight={totalHeight}
      highlightLine={highlightLine}
      highlightTop={highlightTop}
      currentLineHeight={currentLineHeight}
      normalizedContent={normalizedContent}
      handleTextLayout={handleTextLayout}
      handleChangeText={handleChangeText}
      handleSelectionChange={handleSelectionChange}
      onTapBlank={focusInput}
      onReadOnlyNotice={onReadOnlyNotice}
    />
  );

  const horizontalPadding = showLineNumbers
    ? (edgeSpacing ?? 0)
    : Math.max(edgeSpacing ?? 0, 12);

  return (
    <ScrollView
      ref={scrollViewRef}
      onScroll={handleScroll}
      onLayout={handleLayout}
      scrollEventThrottle={16}
      style={{ flex: 1, marginBottom: keyboardHeight }}
      contentContainerStyle={{
        flexGrow: 1,
        minHeight: "100%",
        paddingBottom: 24,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      <View
        onTouchEnd={(e) => {
          if (editable && e.target === e.currentTarget) {
            focusInput();
          }
        }}
        style={{
          flexDirection: "row",
          flex: 1,
          minHeight: totalHeight,
          paddingLeft: horizontalPadding,
          paddingRight: horizontalPadding,
        }}
      >
        {showLineNumbers && (
          <TouchableOpacity activeOpacity={1} onPress={focusInput}>
            <EditorGutter
              lines={lines}
              visualLines={visualLines}
              wordWrap={wordWrap}
              gutterWidth={gutterWidth}
              lineHeight={lineHeight}
              fontSize={fontSize}
              gutterColor={gutterColor}
              resolvedFont={resolvedFont}
              paddingTop={CONTENT_PADDING_TOP}
            />
          </TouchableOpacity>
        )}

        {wordWrap ? (
          <View className="flex-1">{canvasElement}</View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              minWidth: "100%",
              minHeight: totalHeight,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {canvasElement}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};
