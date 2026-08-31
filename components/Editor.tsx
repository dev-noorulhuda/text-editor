import { useCallback, useMemo, useRef } from "react";
import { View, Text, TextInput } from "react-native";
import { colors } from "@/lib/colors";
import type { EditorProps } from "@/types/editorTypes";

const LINE_HEIGHT_RATIO = 1.5;

export const Editor = ({
  content,
  isDark,
  editable,
  fontSize,
  highlightLine,
  showLineNumbers,
  currentLine,
  onChangeText,
  onSelectionChange,
}: EditorProps) => {
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const inputRef = useRef<TextInput>(null);

  const lines = useMemo(() => {
    const split = content.split("\n");
    if (split.length === 1 && split[0] === "") return [""];
    return split;
  }, [content]);

  const gutterWidth = useMemo(() => {
    const digits = String(Math.max(lines.length, 1)).length;
    return digits * 10 + 28;
  }, [lines.length]);

  const handleSelectionChange = useCallback(
    (e: { nativeEvent: { selection: { start: number } } }) => {
      const { start } = e.nativeEvent.selection;
      const textBefore = content.substring(0, start);
      const line = textBefore.split("\n").length;
      onSelectionChange(line);
    },
    [content, onSelectionChange]
  );

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText(text);
      requestAnimationFrame(() => {
        if (!inputRef.current) return;
        inputRef.current.focus();
      });
    },
    [onChangeText]
  );

  const highlightTop = useMemo(
    () => (currentLine - 1) * lineHeight,
    [currentLine, lineHeight]
  );

  const lineHighlightBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)";

  const gutterBg = isDark ? colors.dark[600] : colors.white[200];
  const gutterActiveColor = isDark ? colors.dark[100] : colors.white[900];
  const gutterColor = isDark ? colors.dark[300] : colors.white[500];

  return (
    <View className="flex-1 flex-row">
      {showLineNumbers && (
        <View
          style={{
            width: gutterWidth,
            backgroundColor: gutterBg,
            paddingTop: 12,
            paddingBottom: 12,
            paddingRight: 6,
            alignItems: "flex-end",
          }}
        >
          {lines.map((_, i) => {
            const isActive = i + 1 === currentLine;
            return (
              <Text
                key={i}
                style={{
                  fontSize: fontSize - 2,
                  lineHeight,
                  color: isActive ? gutterActiveColor : gutterColor,
                  fontWeight: isActive ? "700" : "400",
                  textAlign: "right",
                  minWidth: gutterWidth - 8,
                }}
              >
                {i + 1}
              </Text>
            );
          })}
        </View>
      )}

      <View className="flex-1" style={{ position: "relative" }}>
        {highlightLine && (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: highlightTop + 12,
              height: lineHeight,
              backgroundColor: lineHighlightBg,
              pointerEvents: "none",
            }}
          />
        )}
        <TextInput
          ref={inputRef}
          className="flex-1"
          style={{
            fontSize,
            lineHeight,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 12,
            backgroundColor: "transparent",
            color: isDark ? colors.dark[50] : colors.white[900],
          }}
          multiline
          value={content}
          onChangeText={handleChangeText}
          onSelectionChange={handleSelectionChange}
          placeholder="Start typing..."
          placeholderTextColor={isDark ? colors.dark[300] : colors.white[500]}
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
        />
      </View>
    </View>
  );
};
