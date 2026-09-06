import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import { buzz } from "@/lib/haptics";
import { colors } from "@/lib/colors";

interface AnimatedToggleProps {
  enabled: boolean;
  onToggle: () => void;
  isDark: boolean;
}

const TRACK_WIDTH = 38;
const TRACK_HEIGHT = 22;
const THUMB_SIZE = 16;
const THUMB_OFFSET = 3;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_OFFSET * 2;

export const AnimatedToggle = ({
  enabled,
  onToggle,
  isDark,
}: AnimatedToggleProps) => {
  const progress = useSharedValue(enabled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(enabled ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [enabled, progress]);

  const trackStyle = useAnimatedStyle(() => {
    const inactiveColor = isDark ? colors.dark[400] : colors.white[400];
    const activeColor = "#3B82F6";
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor]
    );
    return {
      backgroundColor,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: progress.value * TRAVEL }],
    };
  });

  return (
    <Pressable
      onPress={() => {
        buzz();
        onToggle();
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      hitSlop={8}
    >
      <Animated.View
        style={[
          {
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            justifyContent: "center",
            paddingHorizontal: THUMB_OFFSET,
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: colors.white[50],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2.5,
              elevation: 3,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

export default AnimatedToggle;
