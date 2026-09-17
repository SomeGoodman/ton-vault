import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  TonConnectButton,
  useTonAddress,
  useTonConnectUI,
  useTonWallet
} from "@tonconnect/ui-react";

import {
  Address,
  toNano
} from "@ton/core";

import {
  QRCodeSVG
} from "qrcode.react";

import {
  getTelegramUser,
  tg
} from "./telegram";


type Page =
  | "home"
  | "assets"
  | "activity"
  | "settings";


type ActivityItem = {
  id: string;
  type: "send";
  amount: string;
  address: string;
  date: string;
};


type Asset = {
  symbol: string;
  name: string;
  balance: string;
  usd: string;
  enabled: boolean;
};


const API_BASE = "https://tonapi.io/v2";


function App() {

  const wallet = useTonWallet();

  const rawAddress = useTonAddress(false);

  const [tonConnectUI] = useTonConnectUI();

  const telegramUser = getTelegramUser();

  const telegramApp = tg();

  const [page, setPage] = useState<Page>("home");

  const [balance, setBalance] = useState<string>("0");

  const [loadingBalance, setLoadingBalance] =
    useState(false);

  const [sendOpen, setSendOpen] =
    useState(false);

  const [receiveOpen, setReceiveOpen] =
    useState(false);

  const [sendAddress, setSendAddress] =
    useState("");

  const [sendAmount, setSendAmount] =
    useState("");

  const [sendLoading, setSendLoading] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [activity, setActivity] =
    useState<ActivityItem[]>(() => {

      try {

        const saved =
          localStorage.getItem(
            "ton-vault-activity"
          );

        if (saved) {
          return JSON.parse(saved);
        }

      } catch {
        // ignore
      }

      return [];

    });


  /*
   * Telegram initialization
   */

  useEffect(() => {

    if (!telegramApp) {
      return;
    }

    telegramApp.ready();
    telegramApp.expand();

  }, [telegramApp]);


  /*
   * Load TON balance
   */

  useEffect(() => {

    if (!rawAddress) {

      setBalance("0");

      return;
    }

    let cancelled = false;

    async function loadBalance() {

      try {

        setLoadingBalance(true);

        const address =
          Address.parse(rawAddress).toString();

        const response =
          await fetch(
            `${API_BASE}/accounts/${encodeURIComponent(address)}`
          );

        if (!response.ok) {
          throw new Error(
            `TonAPI HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        const nanotons =
          Number(data.balance ?? 0);

        const tons =
          nanotons / 1_000_000_000;

        if (!cancelled) {

          setBalance(
            tons.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
              }
            )
          );

        }

      } catch (error) {

        console.error(
          "TON balance error:",
          error
        );

        if (!cancelled) {
          setBalance("0");
        }

      } finally {

        if (!cancelled) {
          setLoadingBalance(false);
        }

      }

    }

    loadBalance();

    return () => {
      cancelled = true;
    };

  }, [rawAddress]);


  /*
   * Persist activity
   */

  useEffect(() => {

    localStorage.setItem(
      "ton-vault-activity",
      JSON.stringify(activity)
    );

  }, [activity]);


  /*
   * Assets
   */

  const assets: Asset[] = useMemo(
    () => [
      {
        symbol: "TON",
        name: "Toncoin",
        balance,
        usd: "—",
        enabled: true
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        balance: "0",
        usd: "—",
        enabled: false
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        balance: "0",
        usd: "—",
        enabled: false
      },
      {
        symbol: "BTC",
        name: "Bitcoin",
        balance: "0",
        usd: "—",
        enabled: false
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        balance: "0",
        usd: "—",
        enabled: false
      },
      {
        symbol: "BNB",
        name: "BNB",
        balance: "0",
        usd: "—",
        enabled: false
      }
    ],
    [balance]
  );


  /*
   * Copy address
   */

  async function copyAddress() {

    if (!rawAddress) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        rawAddress
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        1500
      );

    } catch {
      // ignore
    }

  }


  /*
   * Send TON
   */

  async function sendTon() {

    if (!wallet) {

      alert(
        "Сначала подключите TON-кошелёк."
      );

      return;
    }

    if (!sendAddress.trim()) {

      alert(
        "Введите адрес получателя."
      );

      return;
    }

    if (!sendAmount.trim()) {

      alert(
        "Введите сумму TON."
      );

      return;
    }


    try {

      setSendLoading(true);

      const destination =
        Address.parse(
          sendAddress.trim()
        ).toString();

      const nanoAmount =
        toNano(
          sendAmount.trim()
        ).toString();


      await tonConnectUI.sendTransaction({

        validUntil:
          Math.floor(
            Date.now() / 1000
          ) + 600,

        messages: [
          {
            address: destination,
            amount: nanoAmount
          }
        ]

      });


      const item: ActivityItem = {

        id:
          Date.now().toString(),

        type: "send",

        amount:
          sendAmount.trim(),

        address:
          destination,

        date:
          new Date().toLocaleString()

      };


      setActivity(
        previous => [
          item,
          ...previous
        ]
      );


      setSendAddress("");

      setSendAmount("");

      setSendOpen(false);


      if (telegramApp) {

        telegramApp.HapticFeedback
          .notificationOccurred(
            "success"
          );

      }

    } catch (error) {

      console.error(
        "Send transaction error:",
        error
      );

      if (telegramApp) {

        telegramApp.HapticFeedback
          .notificationOccurred(
            "error"
          );

      }

    } finally {

      setSendLoading(false);

    }

  }


  /*
   * Disconnect
   */

  async function disconnect() {

    try {

      await tonConnectUI.disconnect();

    } catch (error) {

      console.error(
        "Disconnect error:",
        error
      );

    }

  }


  /*
   * Address short form
   */

  function shortAddress(
    address: string
  ) {

    if (!address) {
      return "";
    }

    if (address.length < 14) {
      return address;
    }

    return (
      address.slice(0, 7) +
      "..." +
      address.slice(-7)
    );

  }


  /*
   * HOME
   */

  function renderHome() {

    return (

      <div className="page">

        <div className="topbar">

          <div>

            <div className="brand">
              TON Vault
            </div>

            {telegramUser && (

              <div className="telegram-user-name">

                {telegramUser.first_name ||
                  telegramUser.username ||
                  "Telegram"}

              </div>

            )}

          </div>

          <TonConnectButton />

        </div>


        <div className="hero-card">

          <div className="hero-label">
            TOTAL BALANCE
          </div>

          <div className="hero-balance">

            {loadingBalance
              ? "..."
              : `${balance} TON`}

          </div>

          <div className="hero-address">

            {rawAddress
              ? shortAddress(rawAddress)
              : "Wallet not connected"}

          </div>

        </div>


        <div className="actions">

          <button
            className="primary-button"
            onClick={() => {

              if (!wallet) {

                tonConnectUI.openModal();

                return;

              }

              setSendOpen(true);

            }}
          >
            Send
          </button>


          <button
            className="secondary-button"
            onClick={() =>
              setReceiveOpen(true)
            }
          >
            Receive
          </button>

        </div>


        <div className="section-header">

          <h2>
            Assets
          </h2>

          <button
            className="text-button"
            onClick={() =>
              setPage("assets")
            }
          >
            View all
          </button>

        </div>


        <div className="asset-list">

          {assets
            .slice(0, 3)
            .map(asset => (

              <div
                className="asset-row"
                key={asset.symbol}
              >

                <div className="asset-icon">
                  {asset.symbol
                    .slice(0, 1)}
                </div>

                <div className="asset-info">

                  <div className="asset-name">
                    {asset.name}
                  </div>

                  <div className="asset-symbol">
                    {asset.symbol}
                  </div>

                </div>

                <div className="asset-balance">

                  {asset.balance}

                  <span>
                    {" "}
                    {asset.symbol}
                  </span>

                </div>

              </div>

            ))}

        </div>


        <div className="section-header">

          <h2>
            Recent activity
          </h2>

          <button
            className="text-button"
            onClick={() =>
              setPage("activity")
            }
          >
            View all
          </button>

        </div>


        {activity.length === 0 ? (

          <div className="empty-card">

            No transactions yet.

          </div>

        ) : (

          <div className="activity-list">

            {activity
              .slice(0, 3)
              .map(item => (

                <div
                  className="activity-row"
                  key={item.id}
                >

                  <div>

                    <div className="activity-title">
                      Sent TON
                    </div>

                    <div className="activity-date">
                      {item.date}
                    </div>

                  </div>

                  <div className="activity-amount">
                    -{item.amount} TON
                  </div>

                </div>

              ))}

          </div>

        )}

      </div>

    );

  }


  /*
   * ASSETS
   */

  function renderAssets() {

    return (

      <div className="page">

        <div className="page-title">
          Assets
        </div>

        <div className="asset-list">

          {assets.map(asset => (

            <div
              className="asset-row"
              key={asset.symbol}
            >

              <div className="asset-icon">
                {asset.symbol.slice(0, 1)}
              </div>

              <div className="asset-info">

                <div className="asset-name">
                  {asset.name}
                </div>

                <div className="asset-symbol">
                  {asset.enabled
                    ? asset.symbol
                    : "Coming soon"}
                </div>

              </div>

              <div className="asset-balance">
                {asset.balance}
              </div>

            </div>

          ))}

        </div>

      </div>

    );

  }


  /*
   * ACTIVITY
   */

  function renderActivity() {

    return (

      <div className="page">

        <div className="page-title">
          Activity
        </div>

        {activity.length === 0 ? (

          <div className="empty-card">

            No transactions yet.

          </div>

        ) : (

          <div className="activity-list">

            {activity.map(item => (

              <div
                className="activity-row"
                key={item.id}
              >

                <div>

                  <div className="activity-title">
                    Sent TON
                  </div>

                  <div className="activity-date">
                    {item.date}
                  </div>

                  <div className="activity-date">
                    {shortAddress(
                      item.address
                    )}
                  </div>

                </div>

                <div className="activity-amount">
                  -{item.amount} TON
                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    );

  }


  /*
   * SETTINGS
   */

  function renderSettings() {

    return (

      <div className="page">

        <div className="page-title">
          Settings
        </div>


        <div className="settings-card">

          <div className="settings-title">
            Wallet
          </div>

          <div className="settings-row">

            <span>
              Connection
            </span>

            <span>

              {wallet
                ? "Connected"
                : "Not connected"}

            </span>

          </div>


          {rawAddress && (

            <div className="settings-row">

              <span>
                Address
              </span>

              <span>
                {shortAddress(
                  rawAddress
                )}
              </span>

            </div>

          )}

        </div>


        {wallet && (

          <button
            className="danger-button"
            onClick={disconnect}
          >
            Disconnect wallet
          </button>

        )}


        <div className="settings-card">

          <div className="settings-title">
            Telegram
          </div>

          <div className="settings-row">

            <span>
              Mini App
            </span>

            <span>
              {telegramApp
                ? "Active"
                : "Browser"}

            </span>

          </div>


          {telegramUser && (

            <div className="settings-row">

              <span>
                User
              </span>

              <span>

                {telegramUser.username
                  ? `@${telegramUser.username}`
                  : telegramUser.first_name ||
                    "Telegram user"}

              </span>

            </div>

          )}

        </div>

      </div>

    );

  }


  /*
   * Receive modal
   */

  function renderReceive() {

    if (!receiveOpen) {
      return null;
    }

    return (

      <div className="modal-overlay">

        <div className="modal">

          <div className="modal-title">
            Receive TON
          </div>

          {rawAddress ? (

            <>

              <QRCodeSVG
                value={rawAddress}
                size={220}
              />

              <div className="modal-address">
                {rawAddress}
              </div>

              <button
                className="primary-button"
                onClick={copyAddress}
              >
                {copied
                  ? "Copied"
                  : "Copy address"}
              </button>

            </>

          ) : (

            <div className="empty-card">

              Connect your wallet first.

            </div>

          )}


          <button
            className="secondary-button"
            onClick={() =>
              setReceiveOpen(false)
            }
          >
            Close
          </button>

        </div>

      </div>

    );

  }


  /*
   * Send modal
   */

  function renderSend() {

    if (!sendOpen) {
      return null;
    }

    return (

      <div className="modal-overlay">

        <div className="modal">

          <div className="modal-title">
            Send TON
          </div>


          <input
            className="input"
            placeholder="TON address"
            value={sendAddress}
            onChange={event =>
              setSendAddress(
                event.target.value
              )
            }
          />


          <input
            className="input"
            placeholder="Amount TON"
            inputMode="decimal"
            value={sendAmount}
            onChange={event =>
              setSendAmount(
                event.target.value
              )
            }
          />


          <button
            className="primary-button"
            disabled={sendLoading}
            onClick={sendTon}
          >

            {sendLoading
              ? "Waiting for wallet..."
              : "Send TON"}

          </button>


          <button
            className="secondary-button"
            onClick={() =>
              setSendOpen(false)
            }
          >
            Cancel
          </button>

        </div>

      </div>

    );

  }


  /*
   * Bottom navigation
   */

  return (

    <div className="app-shell">

      <div className="telegram-mini-app-badge">

        {telegramApp
          ? "Telegram"
          : "Web"}

        {telegramUser?.username
          ? ` · @${telegramUser.username}`
          : ""}

      </div>


      <main>

        {page === "home" &&
          renderHome()}

        {page === "assets" &&
          renderAssets()}

        {page === "activity" &&
          renderActivity()}

        {page === "settings" &&
          renderSettings()}

      </main>


      <nav className="bottom-nav">

        <button
          className={
            page === "home"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setPage("home")
          }
        >
          Home
        </button>


        <button
          className={
            page === "assets"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setPage("assets")
          }
        >
          Assets
        </button>


        <button
          className={
            page === "activity"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setPage("activity")
          }
        >
          Activity
        </button>


        <button
          className={
            page === "settings"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setPage("settings")
          }
        >
          Settings
        </button>

      </nav>


      {renderReceive()}

      {renderSend()}

    </div>

  );

}


export default App;
