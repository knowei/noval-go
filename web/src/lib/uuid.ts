/**
 * Universal safe UUID generator.
 * Polyfills window.crypto.randomUUID for non-secure contexts (e.g. mobile LAN HTTP access).
 */
export function safeRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID throws
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Global polyfill for browsers in non-secure HTTP contexts (e.g. mobile access over local Wi-Fi)
if (typeof window !== 'undefined') {
  try {
    const win = window as unknown as { crypto?: { randomUUID?: () => string } };
    if (!win.crypto) {
      win.crypto = { randomUUID: safeRandomUUID };
    } else if (!win.crypto.randomUUID) {
      try {
        win.crypto.randomUUID = safeRandomUUID;
      } catch {
        // Object.defineProperty if direct assignment fails
        Object.defineProperty(win.crypto, 'randomUUID', {
          value: safeRandomUUID,
          writable: true,
          configurable: true,
        });
      }
    }
  } catch {
    // ignore
  }
}
