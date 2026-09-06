import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useCallback } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

export interface UnsavedChangesModalProps {
  visible: boolean;
  fileName: string;
  isDark: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export const UnsavedChangesModal = ({
  visible,
  fileName,
  isDark,
  onCancel,
  onDiscard,
  onSave,
}: UnsavedChangesModalProps) => {
  const handleCancel = useCallback(() => {
    buzz();
    onCancel();
  }, [onCancel]);

  const handleDiscard = useCallback(() => {
    buzz();
    onDiscard();
  }, [onDiscard]);

  const handleSave = useCallback(() => {
    buzz();
    onSave();
  }, [onSave]);

  const textPrimary = isDark ? "text-dark-100" : "text-white-900";
  const textSecondary = isDark ? "text-dark-300" : "text-white-500";
  const modalBg = isDark ? "bg-dark-600" : "bg-white-50";
  const cardBorder = isDark ? "border-dark-400" : "border-white-300";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <Pressable
        onPress={handleCancel}
        className="flex-1 items-center justify-center bg-black/60 px-4"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl ${modalBg} ${cardBorder}`}
        >
          {/* Header */}
          <View
            className={`flex-row items-center justify-between pb-3 border-b ${cardBorder}`}
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="help-outline" size={22} color={iconColor} />
              <Text className={`text-base font-bold ${textPrimary}`}>
                Unsaved Changes
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancel} className="p-1">
              <Feather name="x" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View className="my-4">
            <Text className={`text-sm leading-5 ${textPrimary}`}>
              Do you want to save changes to{" "}
              <Text className="font-bold">{fileName || "Untitled"}</Text> before
              closing?
            </Text>
            <Text className={`text-xs mt-2 leading-4 ${textSecondary}`}>
              If you close without saving, any recent edits will be permanently lost.
            </Text>
          </View>

          {/* Action Buttons */}
          <View
            className={`flex-row items-center justify-between mt-2 pt-3 border-t ${cardBorder}`}
          >
            <TouchableOpacity onPress={handleDiscard} className="py-2 px-3">
              <Text className="text-sm font-medium text-red-500 dark:text-red-400">
                Close Anyway
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity onPress={handleCancel} className="py-2 px-3">
                <Text className={`text-sm font-medium ${textSecondary}`}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSave} className="py-2 px-3">
                <Text className={`text-sm font-bold ${textPrimary}`}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default UnsavedChangesModal;
