import { Text, View } from "react-native";

interface EditorGutterProps {
  lines: string[];
  visualLines: { label: string; height?: number }[];
  wordWrap: boolean;
  gutterWidth: number;
  lineHeight: number;
  fontSize: number;
  gutterColor: string;
  resolvedFont: string;
  paddingTop: number;
}

export const EditorGutter = ({
  lines,
  visualLines,
  wordWrap,
  gutterWidth,
  lineHeight,
  fontSize,
  gutterColor,
  resolvedFont,
  paddingTop,
}: EditorGutterProps) => {
  const isWrapped = wordWrap && visualLines.length > 0;
  const items = isWrapped
    ? visualLines.map((v) => ({
        label: v.label,
        height: v.height ?? lineHeight,
      }))
    : lines.map((_, i) => ({
        label: String(i + 1),
        height: lineHeight,
      }));

  return (
    <View
      style={{
        width: gutterWidth,
        paddingTop,
        paddingBottom: 12,
        paddingLeft: 2,
        paddingRight: 4,
        alignItems: "flex-end",
      }}
    >
      {items.map((item, i) => (
        <Text
          key={i}
          numberOfLines={1}
          ellipsizeMode="clip"
          style={{
            fontSize: fontSize - 2,
            height: item.height,
            lineHeight: item.height,
            color: gutterColor,
            textAlign: "right",
            width: "100%",
            fontFamily: resolvedFont,
            includeFontPadding: false,
            flexShrink: 0,
          }}
        >
          {item.label}
        </Text>
      ))}
    </View>
  );
};
