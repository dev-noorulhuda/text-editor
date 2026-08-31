import { useState, useCallback } from "react";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { Feather } from "@expo/vector-icons";
import { Switch } from "react-native";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";
import { loadSettings, saveSettings } from "@/lib/settingsStore";

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40];

interface SettingRowProps {
  label: string;
  description: string;
  isDark: boolean;
  enabled: boolean;
  onToggle: () => void;
}

const SettingRow = ({
  label,
  description,
  isDark,
  enabled,
  onToggle,
}: SettingRowProps) => {
  const textColor = isDark ? "text-dark-100" : "text-white-900";
  const descColor = isDark ? "text-dark-300" : "text-white-500";

  return (
    <View
      className={`flex-row items-center justify-between py-3 ${
        isDark ? "border-dark-400" : "border-white-300"
      } border-b`}
    >
      <View className="flex-1 mr-4">
        <Text className={`text-sm font-medium ${textColor}`}>{label}</Text>
        <Text className={`text-xs mt-0.5 ${descColor}`}>{description}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: isDark ? "#3F3F46" : "#D1D5DB", true: "#3B82F6" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={isDark ? "#3F3F46" : "#D1D5DB"}
      />
    </View>
  );
};

export default function SettingsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [settings, setSettings] = useState(loadSettings);

  const update = useCallback(
    <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  const bg = isDark ? "bg-dark-500" : "bg-white-100";
  const headerBg = isDark ? "bg-dark-600" : "bg-white-200";
  const textPrimary = isDark ? "text-dark-100" : "text-white-900";
  const textSecondary = isDark ? "text-dark-200" : "text-white-600";
  const cardBg = isDark ? "bg-dark-600" : "bg-white-50";
  const cardBorder = isDark ? "border-dark-400" : "border-white-300";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={["top", "bottom"]}>
      <View className={`flex-row items-center gap-3 px-4 py-3 ${headerBg}`}>
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Feather name="arrow-left" size={22} color={iconColor} />
        </TouchableOpacity>
        <Text className={`text-lg font-bold ${textPrimary}`}>Settings</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <View className={`rounded-lg border p-4 mb-4 ${cardBg} ${cardBorder}`}>
          <Text className={`text-xs font-semibold uppercase mb-3 ${textSecondary}`}>
            Editor
          </Text>

          <SettingRow
            label="Highlight current line"
            description="Shows a subtle background on the line where your cursor is"
            isDark={isDark}
            enabled={settings.highlightLine}
            onToggle={() => update("highlightLine", !settings.highlightLine)}
          />

          <SettingRow
            label="Show line numbers"
            description="Displays line numbers in the left gutter"
            isDark={isDark}
            enabled={settings.showLineNumbers}
            onToggle={() => update("showLineNumbers", !settings.showLineNumbers)}
          />
        </View>

        <View className={`rounded-lg border p-4 ${cardBg} ${cardBorder}`}>
          <Text className={`text-xs font-semibold uppercase mb-3 ${textSecondary}`}>
            Default font size
          </Text>
          <Text className={`text-xs mb-3 ${textSecondary}`}>
            Used when opening a new session. Toolbar +/- adjusts per session.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FONT_SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => update("fontSize", size)}
                className={`px-3 py-1.5 rounded-md border ${
                  settings.fontSize === size
                    ? "bg-blue-500 border-blue-500"
                    : isDark
                      ? "bg-dark-500 border-dark-400"
                      : "bg-white-100 border-white-300"
                }`}
              >
                <Text
                  className={`text-xs ${
                    settings.fontSize === size
                      ? "text-white font-bold"
                      : textSecondary
                  }`}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
