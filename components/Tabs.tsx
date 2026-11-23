import {
  DraggableTabItem,
  type TabLayoutRect,
} from "@/components/DraggableTabItem";
import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import type { TabsProps } from "@/types/editorTypes";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  type LayoutChangeEvent,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";

export const Tabs = ({
  files,
  activeFileId,
  isDark,
  onSelect,
  onClose,
  onNew,
  onReorder,
}: TabsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragIndex = useSharedValue(-1);
  const hoverIndex = useSharedValue(-1);
  const dragTranslateX = useSharedValue(0);
  const tabLayouts = useSharedValue<TabLayoutRect[]>([]);
  const layoutsRef = useRef<TabLayoutRect[]>([]);

  useEffect(() => {
    if (layoutsRef.current.length > files.length) {
      layoutsRef.current = layoutsRef.current.slice(0, files.length);
      tabLayouts.set([...layoutsRef.current]);
    }
  }, [files.length, tabLayouts]);

  const handleLayoutTab = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      layoutsRef.current[index] = { x, width };
      tabLayouts.set(layoutsRef.current.slice(0, files.length));
    },
    [files.length, tabLayouts],
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const handleHoverSwap = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      setIsDragging(false);
      if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
        onReorder?.(fromIndex, toIndex);
      }
    },
    [onReorder],
  );

  return (
    <ScrollView
      horizontal
      scrollEnabled={!isDragging}
      showsHorizontalScrollIndicator={false}
      className={`${isDark ? "bg-dark-500" : "bg-white-200"}`}
    >
      {files.map((file, index) => (
        <DraggableTabItem
          key={file.id}
          file={file}
          index={index}
          tabCount={files.length}
          isActive={file.id === activeFileId}
          isDark={isDark}
          dragIndex={dragIndex}
          hoverIndex={hoverIndex}
          dragTranslateX={dragTranslateX}
          tabLayouts={tabLayouts}
          onLayoutTab={handleLayoutTab}
          onSelect={onSelect}
          onClose={onClose}
          onDragStart={handleDragStart}
          onHoverSwap={handleHoverSwap}
          onDragEnd={handleDragEnd}
        />
      ))}
      <TouchableOpacity
        onPress={() => {
          buzz();
          onNew();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="h-9 px-4 justify-center items-center"
      >
        <Feather
          name="plus"
          size={16}
          color={isDark ? colors.dark[300] : colors.white[600]}
        />
      </TouchableOpacity>
    </ScrollView>
  );
};
