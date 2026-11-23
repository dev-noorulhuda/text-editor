type IncomingFileListener = (uri: string) => void;

const pendingUris: string[] = [];
const listeners = new Set<IncomingFileListener>();
let lastUri = "";
let lastTimestamp = 0;

const DEDUPE_WINDOW_MS = 800;

export const extractIncomingFileUri = (rawUrl: string): string | null => {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();

  if (trimmed.startsWith("content://") || trimmed.startsWith("file://")) {
    return trimmed;
  }

  if (trimmed.startsWith("texteditor://")) {
    try {
      const parsed = new URL(trimmed);
      const uriParam =
        parsed.searchParams.get("uri") ?? parsed.searchParams.get("file");
      if (uriParam) {
        return uriParam;
      }
    } catch {
      // ignore malformed custom URL
    }
  }

  return null;
};

export const enqueueIncomingFileUri = (uri: string): void => {
  const now = Date.now();
  if (uri === lastUri && now - lastTimestamp < DEDUPE_WINDOW_MS) {
    return;
  }
  lastUri = uri;
  lastTimestamp = now;

  if (listeners.size > 0) {
    for (const listener of listeners) {
      listener(uri);
    }
    return;
  }

  if (!pendingUris.includes(uri)) {
    pendingUris.push(uri);
  }
};

export const subscribeIncomingFileUri = (
  listener: IncomingFileListener,
): (() => void) => {
  listeners.add(listener);

  while (pendingUris.length > 0) {
    const next = pendingUris.shift();
    if (next) {
      listener(next);
    }
  }

  return () => {
    listeners.delete(listener);
  };
};
