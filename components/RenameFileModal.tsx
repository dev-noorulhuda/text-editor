import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import { Feather } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface RenameFileModalProps {
  visible: boolean;
  currentName: string;
  isDark: boolean;
  onCancel: () => void;
  onConfirm: (newName: string) => void;
}

const INVALID_CHARS_REGEX = /[/\\:*?"<>|]/;

export const RenameFileModal = ({
  visible,
  currentName,
  isDark,
  onCancel,
  onConfirm,
}: RenameFileModalProps) => {
  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevName, setPrevName] = useState(currentName);
  const [draftName, setDraftName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  if (visible !== prevVisible || currentName !== prevName) {
    setPrevVisible(visible);
    setPrevName(currentName);
    if (visible) {
      setDraftName(currentName);
      setError(null);
    }
  }

  const handleCancel = useCallback(() => {
    buzz();
    setError(null);
    onCancel();
  }, [onCancel]);

  const handleSubmit = useCallback(() => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === "." || trimmed === "..") {
      setError("Please enter a valid file name.");
      return;
    }
    if (INVALID_CHARS_REGEX.test(trimmed)) {
      setError('Name cannot contain / \\ : * ? " < > |');
      return;
    }
    buzz();
    setError(null);
    onConfirm(trimmed);
  }, [draftName, onConfirm]);

  const textPrimary = isDark ? "text-dark-100" : "text-white-900";
  const textSecondary = isDark ? "text-dark-300" : "text-white-500";
  const modalBg = isDark ? "bg-dark-600" : "bg-white-50";
  const inputBg = isDark ? "bg-dark-500" : "bg-white-100";
  const cardBorder = isDark ? "border-dark-400" : "border-white-300";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];
  const placeholderColor = isDark ? colors.dark[300] : colors.white[500];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          onPress={handleCancel}
          className="flex-1 items-center justify-center bg-black/60 px-4"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl ${modalBg} ${cardBorder}`}
          >
            <View
              className={`flex-row items-center justify-between pb-3 border-b ${cardBorder}`}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="edit-3" size={20} color={iconColor} />
                <Text className={`text-base font-bold ${textPrimary}`}>
                  Rename File
                </Text>
              </View>
              <TouchableOpacity onPress={handleCancel} className="p-1">
                <Feather name="x" size={20} color={iconColor} />
              </TouchableOpacity>
            </View>

            <View className="my-4">
              <Text className={`text-xs mb-2 ${textSecondary}`}>
                Enter a new name (include extension like .txt, .md, .js)
              </Text>
              <TextInput
                value={draftName}
                onChangeText={(val) => {
                  setDraftName(val);
                  if (error) setError(null);
                }}
                autoFocus
                selectTextOnFocus
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                placeholder="Untitled.txt"
                placeholderTextColor={placeholderColor}
                className={`rounded-lg border px-3 py-2.5 text-sm ${inputBg} ${cardBorder} ${textPrimary}`}
              />
              {error ? (
                <Text className="text-xs text-red-500 dark:text-red-400 mt-1.5">
                  {error}
                </Text>
              ) : null}
            </View>

            <View
              className={`flex-row items-center justify-end gap-2 mt-2 pt-3 border-t ${cardBorder}`}
            >
              <TouchableOpacity onPress={handleCancel} className="py-2 px-3">
                <Text className={`text-sm font-medium ${textSecondary}`}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSubmit} className="py-2 px-3">
                <Text className={`text-sm font-bold ${textPrimary}`}>
                  Rename
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RenameFileModal;
