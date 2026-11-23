import { subscribeIncomingFileUri } from "@/lib/incomingFileQueue";
import { useEffect, useRef } from "react";

export const useIncomingFile = (onOpenUri: (uri: string) => void): void => {
  const callbackRef = useRef(onOpenUri);
  callbackRef.current = onOpenUri;

  useEffect(() => {
    return subscribeIncomingFileUri((uri) => {
      callbackRef.current(uri);
    });
  }, []);
};
