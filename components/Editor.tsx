import { TextInput } from "react-native";

interface EditorProps {
  content: string;
  isDark: boolean;
  onChangeText: (text: string) => void;
}

export const Editor = ({ content, isDark, onChangeText }: EditorProps) => {
  return (
    <TextInput
      className={`flex-1 px-4 py-3 text-base ${
        isDark ? "bg-dark-500 text-dark-50" : "bg-cream-50 text-cream-900"
      }`}
      multiline
      value={content}
      onChangeText={onChangeText}
      placeholder="Start typing..."
      placeholderTextColor={isDark ? "#75757B" : "#D4C494"}
      textAlignVertical="top"
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
};
