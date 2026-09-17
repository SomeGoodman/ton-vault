import React from "react";
import ReactDOM from "react-dom/client";

import {
  TonConnectUIProvider
} from "@tonconnect/ui-react";

import App from "./App";

import "./styles.css";
import { initTelegram } from "./telegram";

initTelegram();

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>

    <TonConnectUIProvider
      manifestUrl="/tonconnect-manifest.json"
      enableAndroidBackHandler={true}
    >

      <App />

    </TonConnectUIProvider>

  </React.StrictMode>
);
