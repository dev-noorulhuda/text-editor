import { AnimatedToggle } from "@/components/AnimatedToggle";
import { EdgeSpacingModal } from "@/components/EdgeSpacingModal";
import { colors } from "@/lib/colors";
import { loadSettings, saveSettings } from "@/lib/settingsStore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  isDark: boolean;
  enabled: boolean;
  onToggle: () => void;
}

const SettingRow = ({
  icon,
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

export default function SettingsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [settings, setSettings] = useState(loadSettings);
  const [showSpacingModal, setShowSpacingModal] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(
    <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => saveSettings(next), 200);
        return next;
      });
    },
    [],
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
          <Text
            className={`text-xs font-semibold uppercase mb-3 ${textSecondary}`}
          >
            Editor
          </Text>

          <SettingRow
            icon={
              <MaterialIcons name="highlight" size={22} color={iconColor} />
            }
            label="Highlight current line"
            description="Shows a subtle background on the line where your cursor is"
            isDark={isDark}
            enabled={settings.highlightLine}
            onToggle={() => update("highlightLine", !settings.highlightLine)}
          />

          <SettingRow
            icon={
              <MaterialIcons
                name="format-list-numbered"
                size={22}
                color={iconColor}
              />
            }
            label="Show line numbers"
            description="Displays line numbers in the left gutter"
            isDark={isDark}
            enabled={settings.showLineNumbers}
            onToggle={() =>
              update("showLineNumbers", !settings.showLineNumbers)
            }
          />

          <TouchableOpacity
            onPress={() => setShowSpacingModal(true)}
            className={`flex-row items-center justify-between py-3 ${
              isDark ? "border-dark-400" : "border-white-300"
            } border-b`}
          >
            <View className="flex-row items-center flex-1 mr-4">
              <View className="mr-3">
                <MaterialIcons name="space-bar" size={22} color={iconColor} />
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-medium ${textPrimary}`}>
                  Edge spacing
                </Text>
                <Text className={`text-xs mt-0.5 ${textSecondary}`}>
                  Spacing from the left screen corner
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Text className={`text-sm font-bold ${textPrimary}`}>
                {settings.edgeSpacing}px
              </Text>
              <Feather name="chevron-right" size={18} color={iconColor} />
            </View>
          </TouchableOpacity>
          <View
            className="flex-row items-center justify-between py-3"
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
                  Default font size for new sessions
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => {
                  const next = Math.max(settings.fontSize - 2, 10);
                  update("fontSize", next);
                }}
                className={`p-1.5 rounded-full border ${cardBorder}`}
              >
                <Feather name="minus" size={16} color={iconColor} />
              </TouchableOpacity>
              <Text
                className={`text-sm font-bold w-12 text-center ${textPrimary}`}
              >
                {settings.fontSize}pts
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const next = Math.min(settings.fontSize + 2, 40);
                  update("fontSize", next);
                }}
                className={`p-1.5 rounded-full border ${cardBorder}`}
              >
                <Feather name="plus" size={16} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <EdgeSpacingModal
        visible={showSpacingModal}
        value={settings.edgeSpacing}
        isDark={isDark}
        onClose={() => setShowSpacingModal(false)}
        onConfirm={(val) => update("edgeSpacing", val)}
      />
    </SafeAreaView>
  );
}
