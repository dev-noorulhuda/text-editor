import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput } from "react-native";
import type { NativeSyntheticEvent, TextInputSelectionChangeEventData } from "react-native";
import { colors } from "@/lib/colors";
import type { EditorProps } from "@/types/editorTypes";

const LINE_HEIGHT_RATIO = 1.5;

export const Editor = ({
  content,
  isDark,
  editable,
  fontSize,
  edgeSpacing,
  highlightLine,
  showLineNumbers,
  currentLine,
  onChangeText,
  onSelectionChange,
}: EditorProps) => {
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const inputRef = useRef<TextInput>(null);
  const textRef = useRef(content);
  const selectionRef = useRef({ start: 0, end: 0 });
  const [prevCurrentLine, setPrevCurrentLine] = useState(currentLine);
  const [activeLine, setActiveLine] = useState(currentLine);

  if (currentLine !== prevCurrentLine) {
    setPrevCurrentLine(currentLine);
    setActiveLine(currentLine);
  }

  useEffect(() => {
    textRef.current = content;
  }, [content]);

  const lines = useMemo(() => {
    const split = content.split("\n");
    if (split.length === 1 && split[0] === "") return [""];
    return split;
  }, [content]);

  const charWidth = useMemo(() => {
    return Math.max(Math.ceil((fontSize - 2) * 0.58), 7);
  }, [fontSize]);

  const gutterWidth = useMemo(() => {
    const digits = String(Math.max(lines.length, 1)).length;
    return digits * charWidth + 16;
  }, [lines.length, charWidth]);

  const handleSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      const { start, end } = e.nativeEvent.selection;
      selectionRef.current = { start, end };
      const currentText = textRef.current;
      const textBefore = currentText.substring(0, start);
      const line = textBefore.split("\n").length;
      setActiveLine(line);
      onSelectionChange(line);
    },
    [onSelectionChange]
  );

  const handleChangeText = useCallback(
    (text: string) => {
      const prevText = textRef.current;
      textRef.current = text;
      onChangeText(text);

      let diffStart = 0;
      while (
        diffStart < prevText.length &&
        diffStart < text.length &&
        prevText[diffStart] === text[diffStart]
      ) {
        diffStart++;
      }
      const addedLength = text.length - prevText.length;
      const cursorIndex = addedLength > 0 ? diffStart + addedLength : diffStart;
      selectionRef.current = { start: cursorIndex, end: cursorIndex };

      const textBefore = text.substring(0, cursorIndex);
      const line = textBefore.split("\n").length;
      setActiveLine(line);
      onSelectionChange(line);
    },
    [onChangeText, onSelectionChange]
  );

  const highlightTop = useMemo(
    () => (activeLine - 1) * lineHeight,
    [activeLine, lineHeight]
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
            paddingLeft: 8,
            paddingRight: 8,
            alignItems: "flex-end",
          }}
        >
          {lines.map((_, i) => {
            const isActive = i + 1 === activeLine;
            return (
              <Text
                key={i}
                style={{
                  fontSize: fontSize - 2,
                  lineHeight,
                  color: isActive ? gutterActiveColor : gutterColor,
                  fontWeight: isActive ? "700" : "400",
                  textAlign: "right",
                  width: "100%",
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
            paddingLeft: showLineNumbers ? 8 : (edgeSpacing ?? 16),
            paddingRight: edgeSpacing ?? 16,
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
