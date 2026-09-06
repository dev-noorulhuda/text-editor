import { AboutSettingsCard } from "@/components/AboutSettingsCard";
import { EdgeSpacingModal } from "@/components/EdgeSpacingModal";
import { FontFamilyModal } from "@/components/FontFamilyModal";
import { FontSettingsCard } from "@/components/FontSettingsCard";
import { SettingRow } from "@/components/SettingRow";
import { colors } from "@/lib/colors";
import { loadSettings, saveSettings } from "@/lib/settingsStore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { buzz } from "@/lib/haptics";

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [settings, setSettings] = useState(loadSettings);
  const [showSpacingModal, setShowSpacingModal] = useState(false);
  const [showFontFamilyModal, setShowFontFamilyModal] = useState(false);
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

  const handleToggleTheme = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setColorScheme(next);
    update("colorScheme", next);
  }, [isDark, setColorScheme, update]);

  const bg = isDark ? "bg-dark-500" : "bg-white-100";
  const headerBg = isDark ? "bg-dark-600" : "bg-white-200";
  const textPrimary = isDark ? "text-dark-100" : "text-white-900";
  const textSecondary = isDark ? "text-dark-200" : "text-white-600";
  const cardBg = isDark ? "bg-dark-600" : "bg-white-50";
  const cardBorder = isDark ? "border-dark-400" : "border-white-300";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={["top", "bottom"]}>
      {/* Header */}
      <View className={`flex-row items-center gap-3 px-4 py-3 ${headerBg}`}>
        <TouchableOpacity
          onPress={() => {
            buzz();
            router.back();
          }}
          className="p-1"
        >
          <Feather name="arrow-left" size={22} color={iconColor} />
        </TouchableOpacity>
        <Text className={`text-lg font-bold ${textPrimary}`}>Settings</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Section 1: Appearance */}
        <View className={`rounded-lg border p-4 mb-4 ${cardBg} ${cardBorder}`}>
          <Text
            className={`text-xs font-semibold uppercase mb-3 ${textSecondary}`}
          >
            Appearance
          </Text>

          <SettingRow
            icon={
              <MaterialIcons
                name={isDark ? "dark-mode" : "light-mode"}
                size={22}
                color={iconColor}
              />
            }
            label="Dark theme"
            description="Use dark background and high-contrast text"
            isDark={isDark}
            enabled={isDark}
            onToggle={handleToggleTheme}
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

          <SettingRow
            icon={
              <MaterialIcons name="highlight" size={22} color={iconColor} />
            }
            label="Highlight current line"
            description="Shows a subtle background on the line where cursor is"
            isDark={isDark}
            enabled={settings.highlightLine}
            onToggle={() => update("highlightLine", !settings.highlightLine)}
            isLast
          />
        </View>

        {/* Section 2: Font Settings */}
        <FontSettingsCard
          fontSize={settings.fontSize}
          fontFamily={settings.fontFamily ?? "system"}
          isDark={isDark}
          onFontSizeChange={(size) => update("fontSize", size)}
          onFontFamilyPress={() => setShowFontFamilyModal(true)}
        />

        {/* Section 3: Editor Settings */}
        <View className={`rounded-lg border p-4 ${cardBg} ${cardBorder}`}>
          <Text
            className={`text-xs font-semibold uppercase mb-3 ${textSecondary}`}
          >
            Editor Settings
          </Text>

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
                  Horizontal spacing from screen edges
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Text className={`text-sm font-bold ${textPrimary}`}>
                {settings.edgeSpacing}dps
              </Text>
              <Feather name="chevron-right" size={18} color={iconColor} />
            </View>
          </TouchableOpacity>

          <SettingRow
            icon={
              <MaterialIcons name="wrap-text" size={22} color={iconColor} />
            }
            label="Word wrap"
            description="Wrap long lines to fit within the screen width"
            isDark={isDark}
            enabled={settings.wordWrap}
            onToggle={() => update("wordWrap", !settings.wordWrap)}
          />

          <SettingRow
            icon={<MaterialIcons name="keyboard" size={22} color={iconColor} />}
            label="Open keyboard at start"
            description="Automatically focus editor and show keyboard on launch"
            isDark={isDark}
            enabled={settings.openKeyboardAtStart}
            onToggle={() =>
              update("openKeyboardAtStart", !settings.openKeyboardAtStart)
            }
          />

          <SettingRow
            icon={
              <MaterialIcons name="restart-alt" size={22} color={iconColor} />
            }
            label="Clear session on restart"
            description="Start with a fresh empty tab on launch instead of restoring text"
            isDark={isDark}
            enabled={settings.clearSessionOnRestart}
            onToggle={() =>
              update("clearSessionOnRestart", !settings.clearSessionOnRestart)
            }
            isLast
          />
        </View>

        {/* Section 4: About */}
        <AboutSettingsCard isDark={isDark} />
      </ScrollView>

      {/* Edge Spacing Modal */}
      <EdgeSpacingModal
        visible={showSpacingModal}
        value={settings.edgeSpacing}
        isDark={isDark}
        onClose={() => setShowSpacingModal(false)}
        onConfirm={(val) => update("edgeSpacing", val)}
      />

      {/* Font Family Modal */}
      <FontFamilyModal
        visible={showFontFamilyModal}
        value={settings.fontFamily ?? "system"}
        isDark={isDark}
        onClose={() => setShowFontFamilyModal(false)}
        onConfirm={(family) => update("fontFamily", family)}
      />
    </SafeAreaView>
  );
}
