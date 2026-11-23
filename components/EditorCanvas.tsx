import { LinkedTextLayer } from "@/components/LinkedTextLayer";
import { colors } from "@/lib/colors";
import { CONTENT_PADDING_TOP } from "@/lib/editorHelpers";
import { buzz } from "@/lib/haptics";
import {
  findLinkAtOffset,
  openUrlInBrowser,
  splitTextWithLinks,
} from "@/lib/linkHelpers";
import { mergeSegmentsWithMatches } from "@/lib/searchHelpers";
import type { EditorCanvasProps } from "@/types/editorTypes";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Text,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputSelectionChangeEvent,
} from "react-native";

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
      searchMatches = [],
      activeMatchIndex = -1,
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
    const hasMatches = searchMatches.length > 0;
    const needsRichOverlay = hasLinks || hasMatches;
    const styledRuns = useMemo(
      () =>
        mergeSegmentsWithMatches(segments, searchMatches, activeMatchIndex),
      [segments, searchMatches, activeMatchIndex],
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

    const themeKey = isDark ? "dark" : "light";
    const textColor = isDark ? colors.dark[50] : colors.white[900];
    const placeholderColor = isDark ? colors.dark[300] : colors.white[500];
    const linkColor = colors.link[themeKey];
    const selectionColor = colors.selection[themeKey];
    const invisibleInputColor = colors.invisibleText[themeKey];
    const matchBg = colors.match[themeKey];
    const activeMatchBg = colors.activeMatch[themeKey];
    const lineHighlightBg = isDark
      ? "rgba(255,255,255,0.07)"
      : "rgba(0,0,0,0.04)";

    const typographyStyle = {
      fontSize,
      lineHeight,
      fontFamily: resolvedFont,
      includeFontPadding: false,
    } as const;
    const canvasPadding = {
      left: padLeft,
      right: 6,
      top: CONTENT_PADDING_TOP,
      bottom: 24,
    };

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
            runs={styledRuns}
            textColor={textColor}
            placeholderColor={placeholderColor}
            linkColor={linkColor}
            matchBg={matchBg}
            activeMatchBg={activeMatchBg}
            baseStyle={typographyStyle}
            padding={canvasPadding}
            totalHeight={totalHeight}
            onLinkPress={handleLinkPress}
          />
        ) : (
          <>
            {needsRichOverlay && (
              <LinkedTextLayer
                mode="backdrop"
                content={normalizedContent}
                runs={styledRuns}
                textColor={textColor}
                placeholderColor={placeholderColor}
                linkColor={linkColor}
                matchBg={matchBg}
                activeMatchBg={activeMatchBg}
                baseStyle={typographyStyle}
                padding={canvasPadding}
              />
            )}

            <TextInput
              key={resolvedFont}
              ref={ref}
              textBreakStrategy="simple"
              style={{
                ...typographyStyle,
                paddingLeft: canvasPadding.left,
                paddingRight: canvasPadding.right,
                paddingTop: canvasPadding.top,
                paddingBottom: canvasPadding.bottom,
                backgroundColor: "transparent",
                color: needsRichOverlay ? invisibleInputColor : textColor,
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
