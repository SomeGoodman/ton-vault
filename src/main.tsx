import React from "react";
import ReactDOM from "react-dom/client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

import App from "./App";
import "./styles.css";

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

  componentDidCatch(error: Error) {
    console.error("TON Vault error:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#050505",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "Arial, sans-serif"
          }}
        >
          <div style={{ maxWidth: "500px" }}>
            <h1>TON Vault</h1>

            <p style={{ color: "#999" }}>
              Application error
            </p>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#111",
                padding: "15px",
                borderRadius: "12px",
                color: "#ff8888"
              }}
            >
              {this.state.error.message}
            </pre>

            <button
              onClick={() => window.location.reload()}
              style={{
                width: "100%",
                padding: "14px",
                border: 0,
                borderRadius: "10px",
                cursor: "pointer"
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TonConnectUIProvider
        manifestUrl="https://ton-vault.vercel.app/tonconnect-manifest.json"
      >
        <App />
      </TonConnectUIProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
