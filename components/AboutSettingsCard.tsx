import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import {
  getAppVersion,
  openWebUrl,
  PRIVACY_POLICY_URL,
  TERMS_CONDITIONS_URL,
} from "@/lib/appLinks";
import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface AboutSettingsCardProps {
  isDark: boolean;
}

export const AboutSettingsCard = ({ isDark }: AboutSettingsCardProps) => {
  const version = useMemo(() => getAppVersion(), []);

  const textPrimary = isDark ? "text-dark-100" : "text-white-900";
  const textSecondary = isDark ? "text-dark-200" : "text-white-600";
  const textMuted = isDark ? "text-dark-300" : "text-white-500";
  const cardBg = isDark ? "bg-dark-600" : "bg-white-50";
  const cardBorder = isDark ? "border-dark-400" : "border-white-300";
  const rowBorder = isDark ? "border-dark-400" : "border-white-300";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];

  return (
    <View className={`rounded-lg border p-4 mt-4 mb-6 ${cardBg} ${cardBorder}`}>
      <Text
        className={`text-xs font-semibold uppercase mb-3 ${textSecondary}`}
      >
        About
      </Text>

      {/* App Version Row */}
      <View
        className={`flex-row items-center justify-between py-3 border-b ${rowBorder}`}
      >
        <View className="flex-row items-center flex-1 mr-4">
          <View className="mr-3">
            <Feather name="info" size={20} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className={`text-sm font-medium ${textPrimary}`}>
              App Version
            </Text>
            <Text className={`text-xs mt-0.5 ${textMuted}`}>
              Installed version of Text Editor
            </Text>
          </View>
        </View>
        <View className="px-2.5 py-1 rounded bg-dark-500/10 dark:bg-white-500/10">
          <Text className={`text-xs font-bold ${textPrimary}`}>
            v{version}
          </Text>
        </View>
      </View>

      {/* Privacy Policy Row */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          buzz();
          openWebUrl(PRIVACY_POLICY_URL);
        }}
        className={`flex-row items-center justify-between py-3 border-b ${rowBorder}`}
      >
        <View className="flex-row items-center flex-1 mr-4">
          <View className="mr-3">
            <Feather name="shield" size={20} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className={`text-sm font-medium ${textPrimary}`}>
              Privacy Policy
            </Text>
            <Text className={`text-xs mt-0.5 ${textMuted}`}>
              Read our privacy commitments and data handling
            </Text>
          </View>
        </View>
        <Feather name="external-link" size={16} color={iconColor} />
      </TouchableOpacity>

      {/* Terms & Conditions Row */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          buzz();
          openWebUrl(TERMS_CONDITIONS_URL);
        }}
        className="flex-row items-center justify-between py-3"
      >
        <View className="flex-row items-center flex-1 mr-4">
          <View className="mr-3">
            <Feather name="file-text" size={20} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className={`text-sm font-medium ${textPrimary}`}>
              Terms & Conditions
            </Text>
            <Text className={`text-xs mt-0.5 ${textMuted}`}>
              Read our terms of service and usage guidelines
            </Text>
          </View>
        </View>
        <Feather name="external-link" size={16} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

export default AboutSettingsCard;
