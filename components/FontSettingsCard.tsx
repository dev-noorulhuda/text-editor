import { FontSizeRow } from "@/components/FontSizeRow";
import { colors } from "@/lib/colors";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface FontSettingsCardProps {
  fontSize: number;
  fontFamily: string;
  isDark: boolean;
  onFontSizeChange: (size: number) => void;
  onFontFamilyPress: () => void;
}

const formatFontFamily = (family: string) => {
  return family.charAt(0).toUpperCase() + family.slice(1);
};

export const FontSettingsCard = ({
  fontSize,
  fontFamily,
  isDark,
  onFontSizeChange,
  onFontFamilyPress,
}: FontSettingsCardProps) => {
  const cardBg = isDark ? "bg-dark-600" : "bg-white-50";
  const cardBorder = isDark ? "border-dark-400" : "border-white-300";
  const textPrimary = isDark ? "text-dark-100" : "text-white-900";
  const textSecondary = isDark ? "text-dark-200" : "text-white-600";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];

  return (
    <View className={`rounded-lg border p-4 mb-4 ${cardBg} ${cardBorder}`}>
      <Text className={`text-xs font-semibold uppercase mb-3 ${textSecondary}`}>
        Font Settings
      </Text>

      <FontSizeRow
        fontSize={fontSize}
        isDark={isDark}
        onChange={onFontSizeChange}
      />

      <TouchableOpacity
        onPress={onFontFamilyPress}
        className="flex-row items-center justify-between py-3"
      >
        <View className="flex-row items-center flex-1 mr-4">
          <View className="mr-3">
            <MaterialIcons name="font-download" size={22} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className={`text-sm font-medium ${textPrimary}`}>
              Font family
            </Text>
            <Text className={`text-xs mt-0.5 ${textSecondary}`}>
              Typeface used across the editor
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Text className={`text-sm font-bold ${textPrimary}`}>
            {formatFontFamily(fontFamily)}
          </Text>
          <Feather name="chevron-right" size={18} color={iconColor} />
        </View>
      </TouchableOpacity>
    </View>
  );
};
