import { CONTENT_PADDING_TOP } from "@/lib/editorHelpers";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from "react-native";

interface UseEditorScrollProps {
  highlightTop: number;
  currentLineHeight: number;
}

export const useEditorScroll = ({
  highlightTop,
  currentLineHeight,
}: UseEditorScrollProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollYRef = useRef(0);
  const layoutHeightRef = useRef(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const visibleHeight = layoutHeightRef.current;
    if (visibleHeight <= 0) return;

    const lineTop = highlightTop + CONTENT_PADDING_TOP;
    const lineBottom = lineTop + currentLineHeight + 24;
    const scrollY = scrollYRef.current;

    if (lineBottom > scrollY + visibleHeight) {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, lineBottom - visibleHeight + 20),
        animated: true,
      });
    } else if (lineTop < scrollY) {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, lineTop - 20),
        animated: true,
      });
    }
  }, [highlightTop, currentLineHeight, keyboardHeight]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollYRef.current = e.nativeEvent.contentOffset.y;
    },
    [],
  );

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      layoutHeightRef.current = e.nativeEvent.layout.height;
    },
    [],
  );

  return {
    scrollViewRef,
    keyboardHeight,
    handleScroll,
    handleLayout,
  };
};
