import { TextInput } from "react-native";
import { colors } from "@/lib/colors";
import type { EditorProps } from "@/types/editorTypes";

export const Editor = ({ content, isDark, editable, onChangeText }: EditorProps) => {
  return (
    <TextInput
      className={`flex-1 px-4 py-3 text-base ${
        isDark ? "bg-dark-500 text-dark-50" : "bg-white-50 text-white-900"
      }`}
      multiline
      value={content}
      onChangeText={onChangeText}
      placeholder="Start typing..."
      placeholderTextColor={isDark ? colors.dark[300] : colors.white[500]}
      textAlignVertical="top"
      autoCapitalize="none"
      autoCorrect={false}
      editable={editable}
    />
  );
};
