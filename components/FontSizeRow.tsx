import { colors } from "@/lib/colors";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface FontSizeRowProps {
  fontSize: number;
  isDark: boolean;
  onChange: (size: number) => void;
  isLast?: boolean;
}

export const FontSizeRow = ({
  fontSize,
  isDark,
  onChange,
  isLast = false,
}: FontSizeRowProps) => {
  const textPrimary = isDark ? "text-dark-100" : "text-white-900";
  const textSecondary = isDark ? "text-dark-200" : "text-white-600";
  const cardBorder = isDark ? "border-dark-400" : "border-white-300";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];

  return (
    <View
      className={`flex-row items-center justify-between py-3 ${
        isLast ? "" : `${cardBorder} border-b`
      }`}
    >
      <View className="flex-row items-center flex-1 mr-4">
        <View className="mr-3">
          <MaterialIcons name="format-size" size={22} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className={`text-sm font-medium ${textPrimary}`}>
            Font size
          </Text>
          <Text className={`text-xs mt-0.5 ${textSecondary}`}>
            Default font size for editor text
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => onChange(Math.max(fontSize - 2, 10))}
          className={`p-1.5 rounded-full border ${cardBorder}`}
        >
          <Feather name="minus" size={16} color={iconColor} />
        </TouchableOpacity>
        <Text className={`text-sm font-bold w-12 text-center ${textPrimary}`}>
          {fontSize}pts
        </Text>
        <TouchableOpacity
          onPress={() => onChange(Math.min(fontSize + 2, 40))}
          className={`p-1.5 rounded-full border ${cardBorder}`}
        >
          <Feather name="plus" size={16} color={iconColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FontSizeRow;
