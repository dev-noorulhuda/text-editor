import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import "../global.css";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme === "dark" ? "#28282B" : "#F9FAFB",
        },
      }}
    />
  );
}
