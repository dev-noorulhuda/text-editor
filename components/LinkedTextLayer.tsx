import type { TextSegment } from "@/lib/linkHelpers";
import { Text, type TextStyle } from "react-native";

export interface LinkedTextLayerProps {
  mode: "readonly" | "backdrop";
  content: string;
  segments: TextSegment[];
  textColor: string;
  placeholderColor: string;
  linkColor: string;
  baseStyle: TextStyle;
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
  totalHeight,
  onLinkPress,
}: LinkedTextLayerProps) => {
  if (mode === "readonly") {
    return (
      <Text
        selectable
        textBreakStrategy="simple"
        style={{
          ...baseStyle,
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
    <Text
      pointerEvents="none"
      textBreakStrategy="simple"
      style={{
        ...baseStyle,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
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
  );
};

export default LinkedTextLayer;
