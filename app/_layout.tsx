import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { colors } from "@/lib/colors";
import { loadSettings } from "@/lib/settingsStore";
import "../global.css";

const persisted = loadSettings();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (persisted.colorScheme !== colorScheme) {
    setColorScheme(persisted.colorScheme);
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? colors.dark[500] : colors.white[100],
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}
