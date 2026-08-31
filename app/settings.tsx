import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";

export default function SettingsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "bg-dark-500" : "bg-white-100";
  const headerBg = isDark ? "bg-dark-600" : "bg-white-200";
  const textPrimary = isDark ? "text-dark-100" : "text-white-900";
  const textSecondary = isDark ? "text-dark-200" : "text-white-600";
  const cardBg = isDark ? "bg-dark-600" : "bg-white-50";
  const cardBorder = isDark ? "border-dark-400" : "border-white-300";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={["top", "bottom"]}>
      <View
        className={`flex-row items-center gap-3 px-4 py-3 ${headerBg}`}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Feather name="arrow-left" size={22} color={iconColor} />
        </TouchableOpacity>
        <Text className={`text-lg font-bold ${textPrimary}`}>Settings</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <View
          className={`rounded-lg border p-4 ${cardBg} ${cardBorder}`}
        >
          <Text className={`text-sm font-semibold mb-3 ${textSecondary}`}>
            Coming soon
          </Text>
          <Text className={`text-sm ${textSecondary}`}>
            Toggles for restore session, theme, font size defaults, encoding,
            and more will be added here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
