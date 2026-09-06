import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

export const PRIVACY_POLICY_URL =
  "https://texteditor-app.netlify.app/privacy";
export const TERMS_CONDITIONS_URL =
  "https://texteditor-app.netlify.app/terms";
export const WEBSITE_URL = "https://texteditor-app.netlify.app";

export const getAppVersion = (): string => {
  return (
    Constants.expoConfig?.version ??
    Constants.manifest2?.extra?.expoClient?.version ??
    "1.0.0"
  );
};

export const openWebUrl = async (url: string): Promise<void> => {
  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  } catch {
    try {
      await Linking.openURL(url);
    } catch {
      // ignore
    }
  }
};
