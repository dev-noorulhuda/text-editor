import type { StyledTextRun } from "@/lib/searchHelpers";
import { Text, View, type TextStyle } from "react-native";

export interface CanvasPadding {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface LinkedTextLayerProps {
  mode: "readonly" | "backdrop";
  content: string;
  runs: StyledTextRun[];
  textColor: string;
  placeholderColor: string;
  linkColor: string;
  matchBg: string;
  activeMatchBg: string;
  baseStyle: TextStyle;
  padding: CanvasPadding;
  totalHeight?: number;
  onLinkPress?: (url: string) => void;
}

export const LinkedTextLayer = ({
  mode,
  content,
  runs,
  textColor,
  placeholderColor,
  linkColor,
  matchBg,
  activeMatchBg,
  baseStyle,
  padding,
  totalHeight,
  onLinkPress,
}: LinkedTextLayerProps) => {
  const paddingStyle = {
    paddingLeft: padding.left,
    paddingRight: padding.right,
    paddingTop: padding.top,
    paddingBottom: padding.bottom,
  };

  const renderRuns = (clickableLinks: boolean) =>
    runs.map((run, i) => {
      const bg =
        run.matchType === "active"
          ? activeMatchBg
          : run.matchType === "match"
            ? matchBg
            : undefined;

      if (!run.isLink && !bg) {
        return run.text;
      }

      return (
        <Text
          key={i}
          onPress={
            clickableLinks && run.isLink && run.url
              ? () => onLinkPress?.(run.url!)
              : undefined
          }
          style={{
            color: run.isLink ? linkColor : undefined,
            textDecorationLine: run.isLink ? "underline" : undefined,
            backgroundColor: bg,
          }}
        >
          {run.text}
        </Text>
      );
    });

  if (mode === "readonly") {
    return (
      <Text
        selectable
        textBreakStrategy="simple"
        style={{
          ...baseStyle,
          ...paddingStyle,
          color: content ? textColor : placeholderColor,
          flex: 1,
          minHeight: totalHeight,
          width: "100%",
        }}
      >
        {!content ? "Write something..." : renderRuns(true)}
      </Text>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        ...paddingStyle,
      }}
    >
      <Text
        selectable={false}
        textBreakStrategy="simple"
        style={{
          ...baseStyle,
          color: textColor,
          userSelect: "none",
        }}
      >
        {renderRuns(false)}
        {content.endsWith("\n") ? " " : ""}
      </Text>
    </View>
  );
};

export default LinkedTextLayer;
