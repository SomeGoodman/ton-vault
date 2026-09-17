import React from "react";
import ReactDOM from "react-dom/client";

import {
  TonConnectUIProvider
} from "@tonconnect/ui-react";

import App from "./App";
import "./styles.css";
import { initTelegram } from "./telegram";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("TON Vault runtime error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#050505",
            color: "#fff",
            padding: "32px 20px",
            fontFamily:
              "-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              maxWidth: "680px",
              margin: "0 auto"
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "18px" }}>
              ⚠️
            </div>

            <h1 style={{ marginBottom: "12px" }}>
              TON Vault
            </h1>

            <p
              style={{
                color: "#aaa",
                lineHeight: 1.6,
                marginBottom: "24px"
              }}
            >
              Приложение запустилось, но произошла ошибка JavaScript.
            </p>

            <div
              style={{
                background: "#111",
                border: "1px solid #292929",
                borderRadius: "14px",
                padding: "16px",
                overflowX: "auto",
                fontSize: "13px",
                lineHeight: 1.5,
                color: "#ff8f8f"
              }}
            >
              {this.state.error.message}
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: "#fff",
                color: "#000",
                fontWeight: 700,
                fontSize: "16px"
              }}
            >
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  initTelegram();
} catch (e) {
  console.warn("Telegram init skipped:", e);
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TonConnectUIProvider
        manifestUrl="/tonconnect-manifest.json"
        enableAndroidBackHandler={true}
      >
        <App />
      </TonConnectUIProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
