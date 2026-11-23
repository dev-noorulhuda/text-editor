import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import type { TabFile } from "@/types/editorTypes";
import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  Text,
  TouchableOpacity,
  type LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export interface TabLayoutRect {
  x: number;
  width: number;
}

export interface DraggableTabItemProps {
  file: TabFile;
  index: number;
  tabCount: number;
  isActive: boolean;
  isDark: boolean;
  dragIndex: SharedValue<number>;
  hoverIndex: SharedValue<number>;
  dragTranslateX: SharedValue<number>;
  tabLayouts: SharedValue<TabLayoutRect[]>;
  onLayoutTab: (index: number, e: LayoutChangeEvent) => void;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onDragStart: () => void;
  onHoverSwap: () => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
}

const SHIFT_DURATION = 160;
const LONG_PRESS_MS = 220;

export const DraggableTabItem = ({
  file,
  index,
  tabCount,
  isActive,
  isDark,
  dragIndex,
  hoverIndex,
  dragTranslateX,
  tabLayouts,
  onLayoutTab,
  onSelect,
  onClose,
  onDragStart,
  onHoverSwap,
  onDragEnd,
}: DraggableTabItemProps) => {
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(tabCount > 1)
        .activateAfterLongPress(LONG_PRESS_MS)
        .onStart(() => {
          "worklet";
          dragIndex.set(index);
          hoverIndex.set(index);
          dragTranslateX.set(0);
          scheduleOnRN(onDragStart);
        })
        .onUpdate((e) => {
          "worklet";
          dragTranslateX.set(e.translationX);
          const layouts = tabLayouts.get();
          const origin = layouts[index];
          if (!origin) return;

          const dragCenter = origin.x + origin.width / 2 + e.translationX;
          let target = index;

          if (e.translationX > 0) {
            for (let j = index + 1; j < layouts.length; j++) {
              const item = layouts[j];
              if (item && dragCenter > item.x + item.width / 2) {
                target = j;
              }
            }
          } else if (e.translationX < 0) {
            for (let j = index - 1; j >= 0; j--) {
              const item = layouts[j];
              if (item && dragCenter < item.x + item.width / 2) {
                target = j;
              }
            }
          }

          if (target !== hoverIndex.get()) {
            hoverIndex.set(target);
            scheduleOnRN(onHoverSwap);
          }
        })
        .onFinalize(() => {
          "worklet";
          if (dragIndex.get() !== index) return;
          const from = dragIndex.get();
          const to = hoverIndex.get();
          dragIndex.set(-1);
          hoverIndex.set(-1);
          dragTranslateX.set(0);
          scheduleOnRN(onDragEnd, from, to);
        }),
    [
      index,
      tabCount,
      dragIndex,
      hoverIndex,
      dragTranslateX,
      tabLayouts,
      onDragStart,
      onHoverSwap,
      onDragEnd,
    ],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const activeDrag = dragIndex.get();
    if (activeDrag === -1) {
      return {
        transform: [{ translateX: 0 }, { scale: 1 }],
        zIndex: 0,
        elevation: 0,
        opacity: 1,
      };
    }

    if (activeDrag === index) {
      return {
        transform: [
          { translateX: dragTranslateX.get() },
          { scale: withTiming(1.04, { duration: 120 }) },
        ],
        zIndex: 100,
        elevation: 6,
        opacity: 0.95,
      };
    }

    const draggedWidth = tabLayouts.get()[activeDrag]?.width ?? 0;
    const target = hoverIndex.get();
    let shiftX = 0;

    if (activeDrag < target && index > activeDrag && index <= target) {
      shiftX = -draggedWidth;
    } else if (activeDrag > target && index >= target && index < activeDrag) {
      shiftX = draggedWidth;
    }

    return {
      transform: [
        {
          translateX: withTiming(shiftX, {
            duration: SHIFT_DURATION,
            easing: Easing.out(Easing.cubic),
          }),
        },
        { scale: 1 },
      ],
      zIndex: 1,
      elevation: 0,
      opacity: 1,
    };
  });

  const activeClass = isActive
    ? isDark
      ? "border-b-2 border-dark-50 bg-dark-600"
      : "border-b-2 border-white-400 bg-white-50"
    : "";

  const labelClass = isActive
    ? isDark
      ? "text-dark-50"
      : "text-white-900"
    : isDark
      ? "text-dark-300"
      : "text-white-600";

  const closeColor = isActive
    ? isDark
      ? colors.dark[200]
      : colors.white[600]
    : isDark
      ? colors.dark[400]
      : colors.white[400];

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        onLayout={(e) => onLayoutTab(index, e)}
        style={animatedStyle}
        className={`h-9 flex-row items-center ${activeClass}`}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            buzz();
            onSelect(file.id);
          }}
          className="h-full flex-row items-center pl-3 pr-1.5"
        >
          <Text selectable={false} className={`text-xs select-none ${labelClass}`}>
            {file.name}
            {file.isModified ? " •" : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
          onPress={() => {
            buzz();
            onClose(file.id);
          }}
          className="h-full px-2.5 justify-center items-center"
        >
          <Feather name="x" size={14} color={closeColor} />
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

export default DraggableTabItem;
