import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

class BootErrorBoundary extends React.Component<
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
    console.error("TON VAULT BOOT ERROR:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          padding: "30px",
          fontFamily: "Arial, sans-serif"
        }}>
          <h1>TON Vault — ошибка</h1>
          <pre style={{
            whiteSpace: "pre-wrap",
            color: "#ff7777",
            background: "#111",
            padding: "16px",
            borderRadius: "12px"
          }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById("root");

if (!root) {
  document.body.innerHTML = `
    <div style="
      background:#050505;
      color:white;
      min-height:100vh;
      padding:30px;
      font-family:Arial
    ">
      <h1>TON Vault</h1>
      <p>Ошибка: #root не найден.</p>
    </div>
  `;
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BootErrorBoundary>
        <App />
      </BootErrorBoundary>
    </React.StrictMode>
  );
}
