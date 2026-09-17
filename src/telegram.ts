export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

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
    if (!tg) {
      console.log("TON Vault: Telegram WebApp API not available");
      return;
    }

    try {
      tg.ready?.();
    } catch (e) {
      console.warn("Telegram ready() failed:", e);
    }

    try {
      tg.expand?.();
    } catch (e) {
      console.warn("Telegram expand() failed:", e);
    }

    console.log("TON Vault: Telegram initialized");
  } catch (e) {
    console.warn("Telegram initialization failed:", e);
  }
}

export function getTelegramUser(): TelegramUser | null {
  try {
    return tg?.initDataUnsafe?.user ?? null;
  } catch (e) {
    console.warn("Unable to read Telegram user:", e);
    return null;
  }
}
