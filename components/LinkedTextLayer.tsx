import type { TextSegment } from "@/lib/linkHelpers";
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
  segments: TextSegment[];
  textColor: string;
  placeholderColor: string;
  linkColor: string;
  baseStyle: TextStyle;
  padding: CanvasPadding;
  totalHeight?: number;
  onLinkPress?: (url: string) => void;
}

export const LinkedTextLayer = ({
  mode,
  content,
  segments,
  textColor,
  placeholderColor,
  linkColor,
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
        {!content
          ? "Write something..."
          : segments.map((seg, i) =>
              seg.isLink && seg.url ? (
                <Text
                  key={i}
                  onPress={() => onLinkPress?.(seg.url!)}
                  style={{
                    color: linkColor,
                    textDecorationLine: "underline",
                  }}
                >
                  {seg.text}
                </Text>
              ) : (
                seg.text
              ),
            )}
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
        textBreakStrategy="simple"
        style={{
          ...baseStyle,
          color: textColor,
        }}
      >
        {segments.map((seg, i) =>
          seg.isLink ? (
            <Text
              key={i}
              style={{
                color: linkColor,
                textDecorationLine: "underline",
              }}
            >
              {seg.text}
            </Text>
          ) : (
            seg.text
          ),
        )}
        {content.endsWith("\n") ? " " : ""}
      </Text>
    </View>
  );
};

export default LinkedTextLayer;
