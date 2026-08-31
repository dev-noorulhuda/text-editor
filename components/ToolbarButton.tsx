import { TouchableOpacity, Text } from "react-native";
import type { ToolbarButtonProps } from "@/types/editorTypes";

export const ToolbarButton = ({ label, onPress, isDark }: ToolbarButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3 py-2 rounded-lg ${
        isDark ? "bg-dark-400" : "bg-cream-300"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          isDark ? "text-dark-100" : "text-cream-800"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
