import { createContext, useContext, useEffect, useState } from "react";

const TradingContext = createContext(null);
const STORAGE_KEY = "coinpilot-account-v1";
export const STARTING_CASH = 10000;
const initialAccount = () => ({ cash: STARTING_CASH, watchlist: ["bitcoin", "ethereum"], holdings: {}, transactions: [] });
function loadAccount() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved.cash === "number" && saved.holdings ? { ...initialAccount(), ...saved } : initialAccount();
  } catch { return initialAccount(); }
}
function makeTransaction(coin, side, quantity, price) {
  return { id: `${Date.now()}-${Math.random()}`, coinId: coin.id, name: coin.name, symbol: coin.symbol, side, quantity, price, total: quantity * price, date: new Date().toISOString() };
}
export function TradingProvider({ children }) {
  const [account, setAccount] = useState(loadAccount);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(account)); }, [account]);

  const toggleWatchlist = (id) => setAccount((a) => ({ ...a, watchlist: a.watchlist.includes(id) ? a.watchlist.filter((x) => x !== id) : [...a.watchlist, id] }));
  const resetAccount = () => { const fresh = initialAccount(); setAccount(fresh); localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); };
  const trade = ({ coin, side, quantity }) => {
    const qty = Number(quantity), price = Number(coin.current_price), value = qty * price;
    const old = account.holdings[coin.id] || { coinId: coin.id, name: coin.name, symbol: coin.symbol, image: coin.image, quantity: 0, avgBuyPrice: 0 };
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0) return { ok: false, message: "Enter a valid quantity and make sure price is available." };
    if (side === "buy" && value > account.cash) return { ok: false, message: "Insufficient virtual cash." };
    if (side === "sell" && qty > old.quantity + 1e-10) return { ok: false, message: "You cannot sell more than you own." };
    if (side === "buy") {
      const nextQty = old.quantity + qty;
      const avgBuyPrice = (old.quantity * old.avgBuyPrice + value) / nextQty;
      setAccount((a) => ({ ...a, cash: a.cash - value, holdings: { ...a.holdings, [coin.id]: { ...old, quantity: nextQty, avgBuyPrice, name: coin.name, symbol: coin.symbol, image: coin.image } }, transactions: [makeTransaction(coin, side, qty, price), ...a.transactions] }));
    } else {
      const holdings = { ...account.holdings };
      const remaining = Math.max(0, old.quantity - qty);
      if (remaining < 1e-10) delete holdings[coin.id]; else holdings[coin.id] = { ...old, quantity: remaining };
      setAccount((a) => ({ ...a, cash: a.cash + value, holdings, transactions: [makeTransaction(coin, side, qty, price), ...a.transactions] }));
    }
    return { ok: true, message: "Trade completed." };
  };
  return <TradingContext.Provider value={{ account, toggleWatchlist, resetAccount, trade }}>{children}</TradingContext.Provider>;
}
export function useTrading() {
  const value = useContext(TradingContext);
  if (!value) throw new Error("useTrading must be used inside TradingProvider");
  return value;
}
