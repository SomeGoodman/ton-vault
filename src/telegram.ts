
declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };

  version: string;
  platform: string;
  colorScheme: "light" | "dark";

  ready(): void;
  expand(): void;
  close(): void;

  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText(text: string): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    onClick(callback: () => void): void;
  };

  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
  };

  HapticFeedback: {
    impactOccurred(style: "light" | "medium" | "heavy"): void;
    notificationOccurred(
      type: "error" | "success" | "warning"
    ): void;
    selectionChanged(): void;
  };

  showAlert(message: string, callback?: () => void): void;
  showConfirm(
    message: string,
    callback?: (confirmed: boolean) => void
  ): void;

  openTelegramLink(url: string): void;
  openLink(url: string): void;
}

export {};

export const tg = (): TelegramWebApp | null => {
  if (
    typeof window !== "undefined" &&
    window.Telegram &&
    window.Telegram.WebApp
  ) {
    return window.Telegram.WebApp;
  }

  return null;
};

export const initTelegram = () => {
  const app = tg();

  if (!app) {
    console.log("Telegram WebApp API unavailable");
    return null;
  }

  app.ready();
  app.expand();

  return app;
};

export const getTelegramUser = (): TelegramUser | null => {
  const app = tg();

  return app?.initDataUnsafe?.user ?? null;
};
