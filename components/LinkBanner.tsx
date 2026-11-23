import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import { formatLinkLabel, openUrlInBrowser } from "@/lib/linkHelpers";
import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface LinkBannerProps {
  url: string | null;
  keyboardHeight: number;
  isDark: boolean;
}

export const LinkBanner = ({
  url,
  keyboardHeight,
  isDark,
}: LinkBannerProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    if (url) {
      opacity.value = withTiming(1, {
        duration: 180,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withTiming(0, {
        duration: 180,
        easing: Easing.out(Easing.ease),
      });
    } else {
      opacity.value = withTiming(0, {
        duration: 140,
        easing: Easing.in(Easing.ease),
      });
      translateY.value = withTiming(12, {
        duration: 140,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [url, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!url) return null;

  const bg = isDark
    ? "bg-dark-600 border-dark-400"
    : "bg-white-50 border-white-300 shadow-md";
  const linkColor = isDark ? colors.link.dark : colors.link.light;
  const linkTextClass = isDark ? "text-link-dark" : "text-link-light";
  const labelTextClass = isDark ? "text-dark-100" : "text-white-900";

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          bottom: keyboardHeight + 14,
          left: 16,
          right: 16,
          alignItems: "center",
          zIndex: 9000,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          buzz();
          void openUrlInBrowser(url);
        }}
        className={`flex-row items-center gap-2 px-4 py-2 rounded-full border shadow-lg max-w-full ${bg}`}
      >
        <Feather name="external-link" size={15} color={linkColor} />
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          className={`text-xs font-semibold shrink ${linkTextClass}`}
        >
          {formatLinkLabel(url)}
        </Text>
        <Text className={`text-xs font-bold ${labelTextClass}`}>Open</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default LinkBanner;
