import React from "react";
import ReactDOM from "react-dom/client";

const root = document.getElementById("root");

if (!root) {
  document.body.innerHTML = `
    <div id="boot-error">
      <h1>TON Vault</h1>
      <p>Root element not found.</p>
    </div>
  `;
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#050505",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
          padding: "30px",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            fontSize: "42px",
            marginBottom: "20px"
          }}
        >
          💎
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "32px"
          }}
        >
          TON Vault
        </h1>

        <p
          style={{
            color: "#999",
            margin: "0",
            fontSize: "16px"
          }}
        >
          React работает.
        </p>

        <p
          style={{
            color: "#666",
            marginTop: "8px",
            fontSize: "13px"
          }}
        >
          Vercel deployment OK
        </p>
      </div>
    </React.StrictMode>
  );
}
