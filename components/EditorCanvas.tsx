import { LinkedTextLayer } from "@/components/LinkedTextLayer";
import { colors } from "@/lib/colors";
import { CONTENT_PADDING_TOP } from "@/lib/editorHelpers";
import { buzz } from "@/lib/haptics";
import {
  findLinkAtOffset,
  openUrlInBrowser,
  splitTextWithLinks,
} from "@/lib/linkHelpers";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Text,
  TextInput,
  View,
  type DimensionValue,
  type TextInputInstance,
  type TextInputSelectionChangeEvent,
  type TextLayoutEvent,
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
  totalHeight?: number;
  highlightLine: boolean;
  highlightTop: number;
  currentLineHeight: number;
  normalizedContent: string;
  handleTextLayout: (e: TextLayoutEvent) => void;
  handleChangeText: (text: string) => void;
  handleSelectionChange: (e: TextInputSelectionChangeEvent) => void;
  onActiveLinkChange?: (url: string | null) => void;
  onTapBlank: () => void;
  onReadOnlyNotice?: () => void;
}

export const EditorCanvas = forwardRef<TextInputInstance, EditorCanvasProps>(
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
      onActiveLinkChange,
      onTapBlank,
      onReadOnlyNotice,
    },
    ref,
  ) => {
    const linkTappedRef = useRef(false);

    const segments = useMemo(
      () => splitTextWithLinks(normalizedContent),
      [normalizedContent],
    );
    const hasLinks = useMemo(
      () => segments.some((seg) => seg.isLink),
      [segments],
    );

    useEffect(() => {
      if (!hasLinks || !editable) {
        onActiveLinkChange?.(null);
      }
    }, [hasLinks, editable, onActiveLinkChange]);

    const handleSelection = useCallback(
      (e: TextInputSelectionChangeEvent) => {
        handleSelectionChange(e);
        if (!onActiveLinkChange) return;
        const { start, end } = e.nativeEvent.selection;
        if (start === end && hasLinks) {
          onActiveLinkChange(findLinkAtOffset(normalizedContent, start));
        } else {
          onActiveLinkChange(null);
        }
      },
      [handleSelectionChange, onActiveLinkChange, hasLinks, normalizedContent],
    );

    const handleLinkPress = useCallback((url: string) => {
      linkTappedRef.current = true;
      buzz();
      void openUrlInBrowser(url);
      setTimeout(() => {
        linkTappedRef.current = false;
      }, 250);
    }, []);

    const textColor = isDark ? colors.dark[50] : colors.white[900];
    const placeholderColor = isDark ? colors.dark[300] : colors.white[500];
    const linkColor = isDark ? colors.link.dark : colors.link.light;
    const selectionColor = isDark
      ? colors.selection.dark
      : colors.selection.light;
    const lineHighlightBg = isDark
      ? "rgba(255,255,255,0.07)"
      : "rgba(0,0,0,0.04)";

    const sharedTextStyle = {
      fontSize,
      lineHeight,
      fontFamily: resolvedFont,
      includeFontPadding: false,
      paddingLeft: padLeft,
      paddingRight: 6,
      paddingTop: CONTENT_PADDING_TOP,
      paddingBottom: 24,
    } as const;

    return (
      <View
        onTouchEnd={(e) => {
          if (!editable) {
            if (!linkTappedRef.current) {
              onReadOnlyNotice?.();
            }
          } else if (e.target === e.currentTarget) {
            onTapBlank();
          }
        }}
        style={{
          flex: 1,
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

        {!editable ? (
          <LinkedTextLayer
            mode="readonly"
            content={normalizedContent}
            segments={segments}
            textColor={textColor}
            placeholderColor={placeholderColor}
            linkColor={linkColor}
            baseStyle={sharedTextStyle}
            totalHeight={totalHeight}
            onLinkPress={handleLinkPress}
          />
        ) : (
          <>
            {hasLinks && (
              <LinkedTextLayer
                mode="backdrop"
                content={normalizedContent}
                segments={segments}
                textColor={textColor}
                placeholderColor={placeholderColor}
                linkColor={linkColor}
                baseStyle={sharedTextStyle}
              />
            )}

            <TextInput
              key={resolvedFont}
              ref={ref}
              textBreakStrategy="simple"
              style={{
                ...sharedTextStyle,
                backgroundColor: "transparent",
                color: hasLinks ? "transparent" : textColor,
                flex: 1,
                minHeight: totalHeight,
                width: "100%",
                textAlignVertical: "top",
              }}
              cursorColor={textColor}
              selectionColor={selectionColor}
              multiline
              scrollEnabled={false}
              value={normalizedContent}
              editable
              onChangeText={handleChangeText}
              onSelectionChange={handleSelection}
              placeholder="Write something..."
              placeholderTextColor={placeholderColor}
              textAlignVertical="top"
              underlineColorAndroid="transparent"
              autoCapitalize="none"
              autoCorrect={false}
              showSoftInputOnFocus
            />
          </>
        )}
      </View>
    );
  },
);

EditorCanvas.displayName = "EditorCanvas";
export default EditorCanvas;
