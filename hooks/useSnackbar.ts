import type { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";

export type SnackbarIcon = keyof typeof MaterialIcons.glyphMap;

export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    icon: SnackbarIcon;
  }>({ visible: false, message: "", icon: "edit-off" });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showNotice = useCallback(
    (
      message: string,
      icon: SnackbarIcon = "check-circle-outline",
      haptic: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success,
    ) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      Haptics.notificationAsync(haptic).catch(() => {});
      setSnackbar({ visible: true, message, icon });
      timeoutRef.current = setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, visible: false }));
      }, 2200);
    },
    [],
  );

  const showReadOnlyNotice = useCallback(() => {
    showNotice(
      "Read-only mode is active",
      "edit-off",
      Haptics.NotificationFeedbackType.Warning,
    );
  }, [showNotice]);

  return { snackbar, showNotice, showReadOnlyNotice };
};
