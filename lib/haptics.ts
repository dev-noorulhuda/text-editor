import * as Haptics from "expo-haptics";

export const buzz = (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
): void => {
  try {
    Haptics.impactAsync(style);
  } catch {
    // ignore
  }
};
