import { TextInput } from "react-native";
import type { EditorProps } from "@/types/editorTypes";

export const Editor = ({ content, isDark, onChangeText }: EditorProps) => {
  return (
    <TextInput
      className={`flex-1 px-4 py-3 text-base ${
        isDark ? "bg-dark-500 text-dark-50" : "bg-white-50 text-white-900"
      }`}
      multiline
      value={content}
      onChangeText={onChangeText}
      placeholder="Start typing..."
      placeholderTextColor={isDark ? "#75757B" : "#9CA3AF"}
      textAlignVertical="top"
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
};
