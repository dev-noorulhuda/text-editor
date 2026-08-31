import { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { File, Paths } from "expo-file-system";

const CONFIG_FILE = "support_prompt.json";
const SHOW_AFTER_DAYS = 7;

interface PromptConfig {
  firstLaunchDate: number;
  hasPrompted: boolean;
}

interface SupportPromptProps {
  isDark: boolean;
}

const loadConfig = (): PromptConfig | null => {
  try {
    const file = new File(Paths.document, CONFIG_FILE);
    if (file.exists) {
      return JSON.parse(file.textSync()) as PromptConfig;
    }
  } catch {
    // ignore
  }
  return null;
};

const saveConfig = (config: PromptConfig): void => {
  try {
    const file = new File(Paths.document, CONFIG_FILE);
    file.write(JSON.stringify(config));
  } catch {
    // ignore
  }
};

const checkShouldShow = (): boolean => {
  const config = loadConfig();

  if (config?.hasPrompted) {
    return false;
  }

  if (!config) {
    saveConfig({ firstLaunchDate: Date.now(), hasPrompted: false });
    return false;
  }

  const days =
    (Date.now() - config.firstLaunchDate) / (1000 * 60 * 60 * 24);

  return days >= SHOW_AFTER_DAYS;
};

export const SupportPrompt = ({ isDark }: SupportPromptProps) => {
  const [visible, setVisible] = useState(checkShouldShow);

  const handleAction = () => {
    saveConfig({ firstLaunchDate: Date.now(), hasPrompted: true });
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View
          className={`w-full max-w-sm rounded-2xl p-6 ${
            isDark ? "bg-dark-600" : "bg-cream-50"
          }`}
        >
          <Text
            className={`text-xl font-bold mb-3 ${
              isDark ? "text-dark-100" : "text-cream-900"
            }`}
          >
            Enjoying Text Editor?
          </Text>

          <Text
            className={`mb-6 leading-relaxed ${
              isDark ? "text-dark-200" : "text-cream-700"
            }`}
          >
            If you find this app useful, consider supporting development with a
            one-time $1 donation. It helps keep the app maintained and
            ad-free!
          </Text>

          <View className="gap-3">
            <TouchableOpacity
              onPress={handleAction}
              className="bg-dark-500 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                Support for $1
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAction}
              className={`py-3 rounded-xl ${
                isDark ? "bg-dark-400" : "bg-cream-200"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  isDark ? "text-dark-200" : "text-cream-700"
                }`}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
