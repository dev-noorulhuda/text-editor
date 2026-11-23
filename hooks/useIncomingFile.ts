import {
  enqueueIncomingFileUri,
  extractIncomingFileUri,
  subscribeIncomingFileUri,
} from "@/lib/incomingFileQueue";
import * as Linking from "expo-linking";
import { useEffect, useRef } from "react";

export const useIncomingFile = (onOpenUri: (uri: string) => void): void => {
  const callbackRef = useRef(onOpenUri);
  callbackRef.current = onOpenUri;

  useEffect(() => {
    const unsubscribe = subscribeIncomingFileUri((uri) => {
      callbackRef.current(uri);
    });

    const handleUrl = (url: string | null) => {
      if (!url) return;
      const fileUri = extractIncomingFileUri(url);
      if (fileUri) {
        enqueueIncomingFileUri(fileUri);
      }
    };

    void Linking.getInitialURL()
      .then(handleUrl)
      .catch(() => {});

    const sub = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => {
      unsubscribe();
      sub.remove();
    };
  }, []);
};
