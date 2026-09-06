import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/lib/colors";

export interface SnackbarProps {
  visible: boolean;
  message: string;
  isDark: boolean;
}

export const Snackbar = ({ visible, message, isDark }: SnackbarProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    } else {
      opacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      translateY.value = withTiming(20, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const bg = isDark
    ? "bg-dark-600 border-dark-400"
    : "bg-white-50 border-white-300 shadow-md";
  const textColor = isDark ? "text-dark-100" : "text-white-900";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animatedStyle,
        {
          position: "absolute",
          bottom: 24,
          left: 20,
          right: 20,
          alignItems: "center",
          zIndex: 9999,
        },
      ]}
    >
      <View
        className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full border shadow-lg ${bg}`}
      >
        <MaterialIcons name="edit-off" size={18} color={iconColor} />
        <Text className={`text-xs font-semibold ${textColor}`}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export default Snackbar;
