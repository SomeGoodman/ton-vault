import { useEffect, useState } from "react";
import {
  TonConnectButton,
  useTonAddress,
  useTonConnectUI
} from "@tonconnect/ui-react";

const TONAPI = "https://tonapi.io/v2";

function shortAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function formatTon(nano: string | number) {
  const value =
    typeof nano === "string"
      ? Number(nano) / 1_000_000_000
      : nano / 1_000_000_000;

  if (!Number.isFinite(value)) return "0";
  return value.toFixed(4);
}

export default function App() {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [error, setError] = useState("");

  const connected = Boolean(address);

  useEffect(() => {
    let cancelled = false;

    async function loadBalance() {
      if (!address) {
        setBalance(null);
        return;
      }

      setLoadingBalance(true);
      setError("");

      try {
        const response = await fetch(
          `${TONAPI}/accounts/${encodeURIComponent(address)}`
        );

        if (!response.ok) {
          throw new Error(`TonAPI HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setBalance(formatTon(data.balance ?? 0));
        }
      } catch (e) {
        console.error(e);

        if (!cancelled) {
          setError("Не удалось получить баланс TON");
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
  }, [address]);

  async function copyAddress() {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
    } catch {
      console.log(address);
    }
  }

  async function disconnect() {
    try {
      await tonConnectUI.disconnect();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="vault">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div>
            <div className="brand-name">TON Vault</div>
            <div className="brand-subtitle">Your TON wallet</div>
          </div>
        </div>

        <TonConnectButton />
      </header>

      <main className="content">

        {!connected ? (
          <section className="welcome">

            <div className="hero-orb">
              <div className="hero-symbol">V</div>
            </div>

            <h1>Your TON Vault</h1>

            <p>
              Connect your TON wallet to manage your assets,
              send and receive TON securely.
            </p>

            <div className="connect-large">
              <TonConnectButton />
            </div>

            <div className="security-note">
              <span>🔐</span>
              <span>Your private keys never leave your wallet.</span>
            </div>

          </section>
        ) : (
          <>
            <section className="balance-card">

              <div className="balance-label">
                Total balance
              </div>

              <div className="balance-value">
                {loadingBalance
                  ? "Loading..."
                  : `${balance ?? "0"} TON`}
              </div>

              <div className="address-row">
                <span>{shortAddress(address)}</span>

                <button
                  className="icon-button"
                  onClick={copyAddress}
                  title="Copy address"
                >
                  ⧉
                </button>
              </div>

            </section>

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            <section className="actions">

              <button
                className="action-card"
                onClick={() => {
                  alert(
                    "Send TON will be connected next."
                  );
                }}
              >
                <div className="action-icon">↑</div>
                <div>
                  <strong>Send</strong>
                  <span>Send TON</span>
                </div>
              </button>

              <button
                className="action-card"
                onClick={() => {
                  alert(
                    "Receive screen will be connected next."
                  );
                }}
              >
                <div className="action-icon">↓</div>
                <div>
                  <strong>Receive</strong>
                  <span>Receive TON</span>
                </div>
              </button>

            </section>

            <section className="wallet-section">

              <div className="section-title">
                Connected wallet
              </div>

              <div className="wallet-card">

                <div className="wallet-avatar">
                  TON
                </div>

                <div className="wallet-info">
                  <strong>{shortAddress(address)}</strong>
                  <span>TON Connect</span>
                </div>

                <button
                  className="disconnect"
                  onClick={disconnect}
                >
                  Disconnect
                </button>

              </div>

            </section>
          </>
        )}

      </main>

      <footer>
        <span>TON Vault</span>
        <span>Non-custodial</span>
      </footer>
    </div>
  );
}
