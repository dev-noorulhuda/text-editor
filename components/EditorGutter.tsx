import { Text, View } from "react-native";

interface EditorGutterProps {
  lines: string[];
  visualLines: { label: string }[];
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
    ? visualLines.map((v) => v.label)
    : lines.map((_, i) => String(i + 1));

  return (
    <View
      style={{
        width: gutterWidth,
        paddingTop,
        paddingBottom: 12,
        paddingLeft: 2,
        paddingRight: 6,
        alignItems: "flex-end",
      }}
    >
      {items.map((label, i) => (
        <Text
          key={i}
          numberOfLines={1}
          style={{
            fontSize: fontSize - 2,
            height: lineHeight,
            lineHeight,
            color: gutterColor,
            textAlign: "right",
            width: "100%",
            fontFamily: resolvedFont,
            includeFontPadding: false,
          }}
        >
          {label}
        </Text>
      ))}
    </View>
  );
};
