import { useMemo } from "react";
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

  const items = useMemo(() => {
    if (!isWrapped) {
      return lines.map((_, i) => ({
        label: String(i + 1),
        height: lineHeight,
      }));
    }

    const result = visualLines.map((v) => ({
      label: v.label,
      height: v.height ?? lineHeight,
    }));

    let maxLogicalLine = 0;
    for (let i = 0; i < visualLines.length; i++) {
      const lbl = visualLines[i]?.label;
      if (lbl) {
        const num = parseInt(lbl, 10);
        if (!isNaN(num) && num > maxLogicalLine) maxLogicalLine = num;
      }
    }

    for (let l = maxLogicalLine + 1; l <= lines.length; l++) {
      result.push({
        label: String(l),
        height: lineHeight,
      });
    }

    return result;
  }, [isWrapped, lines, visualLines, lineHeight]);

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
