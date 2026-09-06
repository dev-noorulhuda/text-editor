import { useCallback, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { GestureResponderEvent } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/lib/colors";

interface EdgeSpacingModalProps {
  visible: boolean;
  value: number;
  isDark: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
}

const MIN = 0;
const MAX = 28;
const STEP = 2;
const DEFAULT_VALUE = 2;

export const EdgeSpacingModal = ({
  visible,
  value,
  isDark,
  onClose,
  onConfirm,
}: EdgeSpacingModalProps) => {
  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevPropValue, setPrevPropValue] = useState(value);
  const [currentValue, setCurrentValue] = useState(value);

  if (visible !== prevVisible || value !== prevPropValue) {
    setPrevVisible(visible);
    setPrevPropValue(value);
    setCurrentValue(value);
  }

  const trackRef = useRef<View>(null);
  const trackPageXRef = useRef(0);
  const trackWidthRef = useRef(240);

  const handleTouch = useCallback((e: GestureResponderEvent) => {
    const width = trackWidthRef.current;
    if (width <= 0) return;
    const relativeX = e.nativeEvent.pageX - trackPageXRef.current;
    const ratio = Math.max(0, Math.min(1, relativeX / width));
    const raw = MIN + ratio * (MAX - MIN);
    const stepped = Math.round(raw / STEP) * STEP;
    setCurrentValue(Math.max(MIN, Math.min(MAX, stepped)));
  }, []);

  const handleGrant = useCallback(
    (e: GestureResponderEvent) => {
      const pageX = e.nativeEvent.pageX;
      trackRef.current?.measureInWindow((x, _y, width) => {
        if (width > 0) {
          trackPageXRef.current = x;
          trackWidthRef.current = width;
          const relativeX = pageX - x;
          const ratio = Math.max(0, Math.min(1, relativeX / width));
          const raw = MIN + ratio * (MAX - MIN);
          const stepped = Math.round(raw / STEP) * STEP;
          setCurrentValue(Math.max(MIN, Math.min(MAX, stepped)));
        }
      });
    },
    [],
  );

  const handleLayout = useCallback(() => {
    trackRef.current?.measureInWindow((x, _y, width) => {
      if (width > 0) {
        trackPageXRef.current = x;
        trackWidthRef.current = width;
      }
    });
  }, []);

  const handleDefault = useCallback(() => {
    setCurrentValue(DEFAULT_VALUE);
  }, []);

  const handleCancel = useCallback(() => {
    setCurrentValue(value);
    onClose();
  }, [value, onClose]);

  const handleOk = useCallback(() => {
    onConfirm(currentValue);
    onClose();
  }, [currentValue, onConfirm, onClose]);

  const textPrimary = isDark ? "text-dark-100" : "text-white-900";
  const textSecondary = isDark ? "text-dark-300" : "text-white-500";
  const modalBg = isDark ? "bg-dark-600" : "bg-white-50";
  const cardBorder = isDark ? "border-dark-400" : "border-white-300";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];

  const fillPercent = ((currentValue - MIN) / (MAX - MIN)) * 100;
  const activeTrackClass = isDark ? "bg-dark-100" : "bg-white-800";
  const inactiveTrackClass = isDark ? "bg-dark-400" : "bg-white-300";
  const thumbBorderClass = isDark ? "border-dark-100" : "border-white-800";
  const thumbBgClass = isDark ? "bg-dark-50" : "bg-white-50";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable
        onPress={handleCancel}
        className="flex-1 items-center justify-center bg-black/60 px-4"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl ${modalBg} ${cardBorder}`}
        >
          {/* Header */}
          <View
            className={`flex-row items-center justify-between pb-3 border-b ${cardBorder}`}
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="space-bar" size={22} color={iconColor} />
              <Text className={`text-base font-bold ${textPrimary}`}>
                Edge Spacing
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancel} className="p-1">
              <Feather name="x" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <Text className={`text-xs mt-3 ${textSecondary}`}>
            Adjust the horizontal spacing from both screen edges for the
            editor canvas.
          </Text>

          {/* Value Display */}
          <View className="items-center my-5">
            <Text className={`text-3xl font-extrabold ${textPrimary}`}>
              {currentValue}
              <Text className={`text-base font-normal ${textSecondary}`}>
                {" "}
                dps
              </Text>
            </Text>
          </View>

          {/* Slider with +/- buttons */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() =>
                setCurrentValue((prev) => Math.max(MIN, prev - STEP))
              }
              className={`p-2 rounded-full border ${cardBorder}`}
            >
              <Feather name="minus" size={16} color={iconColor} />
            </TouchableOpacity>

            <View
              ref={trackRef}
              onLayout={handleLayout}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={handleGrant}
              onResponderMove={handleTouch}
              className="flex-1 h-7 justify-center"
            >
              <View
                pointerEvents="none"
                className={`h-2.5 rounded-full overflow-hidden ${inactiveTrackClass}`}
              >
                <View
                  style={{ width: `${fillPercent}%` }}
                  className={`h-full rounded-full ${activeTrackClass}`}
                />
              </View>
              {/* Thumb */}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: `${fillPercent}%`,
                  transform: [{ translateX: -10 }],
                }}
                className={`w-5 h-5 rounded-full shadow-sm border-2 ${thumbBorderClass} ${thumbBgClass}`}
              />
            </View>

            <TouchableOpacity
              onPress={() =>
                setCurrentValue((prev) => Math.min(MAX, prev + STEP))
              }
              className={`p-2 rounded-full border ${cardBorder}`}
            >
              <Feather name="plus" size={16} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* 3 Action Buttons at the end with NO background color */}
          <View
            className={`flex-row items-center justify-between mt-6 pt-3 border-t ${cardBorder}`}
          >
            <TouchableOpacity onPress={handleDefault} className="py-2 px-3">
              <Text className={`text-sm font-medium ${textSecondary}`}>
                Default
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity onPress={handleCancel} className="py-2 px-3">
                <Text className={`text-sm font-medium ${textSecondary}`}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleOk} className="py-2 px-3">
                <Text className={`text-sm font-bold ${textPrimary}`}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default EdgeSpacingModal;
