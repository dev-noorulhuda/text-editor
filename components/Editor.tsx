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
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

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

  const { scrollViewRef, keyboardHeight, handleScroll, handleLayout } =
    useEditorScroll({
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
  const canvasWidth = wordWrap ? "100%" : Math.max(estimatedWidth, 100);

  const lineHighlightBg = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.04)";
  const gutterColor = isDark ? colors.dark[300] : colors.white[500];
  const resolvedFont = resolveFontFamily(fontFamily);

  const rowCount = Math.max(
    wordWrap && visualLines.length > 0 ? visualLines.length : 0,
    lines.length,
  );
  const totalHeight = Math.max(rowCount * lineHeight + 24, 200);
  const padLeft = showLineNumbers ? 6 : 0;

  const contentBody = (
    <View
      style={{
        minWidth: "100%",
        width: wordWrap ? "100%" : canvasWidth,
        minHeight: totalHeight,
        position: "relative",
      }}
    >
      {wordWrap && (
        <Text
          onTextLayout={handleTextLayout}
          textBreakStrategy="simple"
          style={{
            position: "absolute",
            opacity: 0,
            left: padLeft,
            right: 6,
            fontSize,
            fontFamily: resolvedFont,
            includeFontPadding: false,
            lineHeight,
            pointerEvents: "none",
          }}
        >
          {normalizedContent.endsWith("\n")
            ? `${normalizedContent} `
            : normalizedContent}
        </Text>
      )}
      {highlightLine && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: highlightTop + CONTENT_PADDING_TOP,
            height: currentLineHeight,
            backgroundColor: lineHighlightBg,
            pointerEvents: "none",
          }}
        />
      )}
      <TextInput
        key={resolvedFont}
        ref={inputRef}
        textBreakStrategy="simple"
        style={{
          fontSize,
          lineHeight,
          fontFamily: resolvedFont,
          includeFontPadding: false,
          paddingLeft: padLeft,
          paddingRight: 6,
          paddingTop: CONTENT_PADDING_TOP,
          paddingBottom: 12,
          backgroundColor: "transparent",
          color: isDark ? colors.dark[50] : colors.white[900],
          minHeight: totalHeight,
          width: "100%",
          textAlignVertical: "top",
        }}
        multiline
        scrollEnabled={false}
        value={normalizedContent}
        onChangeText={handleChangeText}
        onSelectionChange={handleSelectionChange}
        placeholder="Start typing..."
        placeholderTextColor={isDark ? colors.dark[300] : colors.white[500]}
        textAlignVertical="top"
        underlineColorAndroid="transparent"
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
      />
    </View>
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
        minHeight: "100%",
        paddingBottom: 24,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      <View
        style={{
          flexDirection: "row",
          minHeight: totalHeight,
          paddingLeft: horizontalPadding,
          paddingRight: horizontalPadding,
        }}
      >
        {showLineNumbers && (
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
        )}

        {wordWrap ? (
          <View className="flex-1">
            {contentBody}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
          >
            {contentBody}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};
