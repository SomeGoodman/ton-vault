declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export const tg =
  typeof window !== "undefined"
    ? window.Telegram?.WebApp
    : undefined;

export function initTelegram() {
  try {
    tg?.ready?.();
    tg?.expand?.();
  } catch (error) {
    console.warn("Telegram WebApp unavailable:", error);
  }
}
