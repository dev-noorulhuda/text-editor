import { colors } from "@/lib/colors";
import { resolveFontFamily } from "@/lib/fontHelpers";
import { buzz } from "@/lib/haptics";
import type { FontFamily } from "@/lib/settingsStore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface FontFamilyModalProps {
  visible: boolean;
  value: FontFamily;
  isDark: boolean;
  onClose: () => void;
  onConfirm: (value: FontFamily) => void;
}

const FONT_OPTIONS: {
  id: FontFamily;
  label: string;
  description: string;
  sample: string;
}[] = [
  {
    id: "monospace",
    label: "Monospace",
    description: "Fixed width, ideal for code",
    sample: "const editor = true;",
  },
  {
    id: "system",
    label: "System",
    description: "Default clean sans-serif",
    sample: "The quick brown fox jumps",
  },
  {
    id: "serif",
    label: "Serif",
    description: "Classic editorial serif",
    sample: "The quick brown fox jumps",
  },
];

const DEFAULT_FAMILY: FontFamily = "system";

export const FontFamilyModal = ({
  visible,
  value,
  isDark,
  onClose,
  onConfirm,
}: FontFamilyModalProps) => {
  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevPropValue, setPrevPropValue] = useState(value);
  const [selectedFamily, setSelectedFamily] = useState<FontFamily>(value);

  if (visible !== prevVisible || value !== prevPropValue) {
    setPrevVisible(visible);
    setPrevPropValue(value);
    setSelectedFamily(value);
  }

  const handleDefault = useCallback(() => {
    buzz();
    setSelectedFamily(DEFAULT_FAMILY);
  }, []);

  const handleCancel = useCallback(() => {
    buzz();
    setSelectedFamily(value);
    onClose();
  }, [value, onClose]);

  const handleOk = useCallback(() => {
    buzz();
    onConfirm(selectedFamily);
    onClose();
  }, [selectedFamily, onConfirm, onClose]);

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
              <MaterialIcons name="font-download" size={22} color={iconColor} />
              <Text className={`text-base font-bold ${textPrimary}`}>
                Font Family
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancel} className="p-1">
              <Feather name="x" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <Text className={`text-xs mt-3 mb-4 ${textSecondary}`}>
            Choose the typeface used across the editor canvas.
          </Text>

          {/* Options */}
          <View className="gap-2.5">
            {FONT_OPTIONS.map((opt) => {
              const isSelected = selectedFamily === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => {
                    buzz();
                    setSelectedFamily(opt.id);
                  }}
                  className={`p-3 rounded-xl border flex-row items-center justify-between ${
                    isSelected
                      ? isDark
                        ? "border-dark-100 bg-dark-500"
                        : "border-white-800 bg-white-200"
                      : `${cardBorder} ${isDark ? "bg-dark-600" : "bg-white-100"}`
                  }`}
                >
                  <View className="flex-1 mr-3">
                    <Text className={`text-sm font-semibold ${textPrimary}`}>
                      {opt.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: resolveFontFamily(opt.id),
                      }}
                      className={`text-xs mt-1 ${textSecondary}`}
                    >
                      {opt.sample}
                    </Text>
                  </View>
                  {isSelected ? (
                    <Feather
                      name="check"
                      size={18}
                      color={isDark ? colors.dark[50] : colors.white[900]}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3 Action Buttons at the end with NO background color */}
          <View
            className={`flex-row items-center justify-between mt-6 pt-3 border-t ${cardBorder}`}
          >
            <TouchableOpacity onPress={handleDefault} className="py-2 px-3">
              <Text className={`text-sm font-medium ${textSecondary}`}>
                Default
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity onPress={handleCancel} className="py-2 px-3">
                <Text className={`text-sm font-medium ${textSecondary}`}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleOk} className="py-2 px-3">
                <Text className={`text-sm font-bold ${textPrimary}`}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default FontFamilyModal;
