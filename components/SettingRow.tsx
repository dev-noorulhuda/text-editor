import { View, Text } from "react-native";
import { AnimatedToggle } from "@/components/AnimatedToggle";

export interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  isDark: boolean;
  enabled: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

export const SettingRow = ({
  icon,
  label,
  description,
  isDark,
  enabled,
  onToggle,
  isLast = false,
}: SettingRowProps) => {
  const textColor = isDark ? "text-dark-100" : "text-white-900";
  const descColor = isDark ? "text-dark-300" : "text-white-500";
  const borderColor = isDark ? "border-dark-400" : "border-white-300";

  return (
    <View
      className={`flex-row items-center justify-between py-3 ${
        isLast ? "" : `${borderColor} border-b`
      }`}
    >
      <View className="flex-row items-center flex-1 mr-4">
        <View className="mr-3">{icon}</View>
        <View className="flex-1">
          <Text className={`text-sm font-medium ${textColor}`}>{label}</Text>
          <Text className={`text-xs mt-0.5 ${descColor}`}>{description}</Text>
        </View>
      </View>
      <AnimatedToggle enabled={enabled} onToggle={onToggle} isDark={isDark} />
    </View>
  );
};

export default SettingRow;
