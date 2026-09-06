import { colors } from "@/lib/colors";
import { CONTENT_PADDING_TOP } from "@/lib/editorHelpers";
import { forwardRef } from "react";
import {
  Text,
  TextInput,
  View,
  type DimensionValue,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
  type TextLayoutEventData,
} from "react-native";

export interface EditorCanvasProps {
  editable: boolean;
  fontSize: number;
  lineHeight: number;
  resolvedFont: string;
  isDark: boolean;
  padLeft: number;
  wordWrap: boolean;
  canvasWidth: DimensionValue;
  totalHeight: number;
  highlightLine: boolean;
  highlightTop: number;
  currentLineHeight: number;
  normalizedContent: string;
  handleTextLayout: (e: NativeSyntheticEvent<TextLayoutEventData>) => void;
  handleChangeText: (text: string) => void;
  handleSelectionChange: (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => void;
  onTapBlank: () => void;
}

export const EditorCanvas = forwardRef<TextInput, EditorCanvasProps>(
  (
    {
      editable,
      fontSize,
      lineHeight,
      resolvedFont,
      isDark,
      padLeft,
      wordWrap,
      canvasWidth,
      totalHeight,
      highlightLine,
      highlightTop,
      currentLineHeight,
      normalizedContent,
      handleTextLayout,
      handleChangeText,
      handleSelectionChange,
      onTapBlank,
    },
    ref,
  ) => {
    const lineHighlightBg = isDark
      ? "rgba(255,255,255,0.07)"
      : "rgba(0,0,0,0.04)";

    return (
      <View
        onTouchEnd={(e) => {
          if (editable && e.target === e.currentTarget) {
            onTapBlank();
          }
        }}
        style={{
          flex: 1,
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
          ref={ref}
          textBreakStrategy="simple"
          style={{
            fontSize,
            lineHeight,
            fontFamily: resolvedFont,
            includeFontPadding: false,
            paddingLeft: padLeft,
            paddingRight: 6,
            paddingTop: CONTENT_PADDING_TOP,
            paddingBottom: 24,
            backgroundColor: "transparent",
            color: isDark ? colors.dark[50] : colors.white[900],
            flex: 1,
            minHeight: totalHeight,
            width: "100%",
            textAlignVertical: "top",
          }}
          multiline
          scrollEnabled={false}
          value={normalizedContent}
          onChangeText={editable ? handleChangeText : undefined}
          onSelectionChange={handleSelectionChange}
          placeholder="Start typing..."
          placeholderTextColor={isDark ? colors.dark[300] : colors.white[500]}
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          autoCorrect={false}
          showSoftInputOnFocus={editable}
        />
      </View>
    );
  },
);

EditorCanvas.displayName = "EditorCanvas";
export default EditorCanvas;
