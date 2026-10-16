import { useState } from "react";
import { X, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { fmt, num } from "../data/marketData";

export default function TradeModal({ coin, side, account, trade, onClose }) {
  const currentHolding = account.holdings[coin.id]?.quantity || 0;
  const [amount, setAmount] = useState(() => side === "sell" ? String(currentHolding) : "100");
  const [unit, setUnit] = useState(() => side === "sell" ? "coin" : "usd");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const price = Number(coin.current_price);
  const quantity = unit === "usd" ? Number(amount || 0) / price : Number(amount || 0);
  const total = quantity * price;
  const holding = account.holdings[coin.id];
  const validPrice = Number.isFinite(price) && price > 0;

  const submit = (event) => {
    event.preventDefault();
    if (!validPrice) { setMessage("A valid market price is not available. Refresh market data before trading."); return; }
    setSubmitting(true);
    const result = trade({ coin, side, quantity });
    setMessage(result.message);
    if (result.ok) window.setTimeout(onClose, 700);
    else setSubmitting(false);
  };

  const fillMax = () => {
    if (side === "sell") {
      setUnit("coin");
      setAmount(String(currentHolding));
    } else {
      setUnit("usd");
      setAmount(String(Math.max(0, account.cash.toFixed(2))));
    }
    setMessage("");
  };

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="trade-modal-title">
        <div className="modalhead"><div><small className="eyebrow">{side === "buy" ? "PLACE SIMULATED BUY" : "PLACE SIMULATED SELL"}</small><h2 id="trade-modal-title">{side === "buy" ? "Buy" : "Sell"} {coin.name}</h2></div><button className="star" onClick={onClose} aria-label="Close trade dialog"><X /></button></div>
        <div className="tradecoin"><img src={coin.image} alt="" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /><div><b>{coin.name} <small>{coin.symbol.toUpperCase()}</small></b><p>Market price <strong>{fmt(price)}</strong></p></div><button type="button" className="max-button" onClick={fillMax}>{side === "sell" ? "Sell all" : "Use all cash"}</button></div>
        <form onSubmit={submit}>
          <label htmlFor="trade-amount">{side === "buy" ? "Amount to buy" : "Amount to sell"}</label>
          <div className="amount"><input id="trade-amount" type="number" min="0" step="any" required value={amount} onChange={(event) => { setAmount(event.target.value); setMessage(""); }} /><select aria-label="Amount unit" value={unit} onChange={(event) => setUnit(event.target.value)}><option value="usd">USD</option><option value="coin">{coin.symbol.toUpperCase()}</option></select></div>
          <div className="summary"><div>Estimated quantity <b>{validPrice ? `${num(quantity)} ${coin.symbol.toUpperCase()}` : "—"}</b></div><div>Order total <b>{validPrice ? fmt(total) : "—"}</b></div><div>Available virtual cash <b>{fmt(account.cash)}</b></div>{side === "sell" && <div>Available holding <b>{num(holding?.quantity || 0)} {coin.symbol.toUpperCase()}</b></div>}</div>
          {message && <div role="status" className={`message ${message.includes("completed") ? "ok" : "bad"}`}>{message}</div>}
          <button className={`btn full ${side === "sell" ? "red" : "primary"}`} disabled={submitting || !validPrice}>{submitting ? "Processing…" : side === "buy" ? <><ArrowDownToLine size={15} /> Confirm simulated buy</> : <><ArrowUpFromLine size={15} /> Confirm simulated sell</>}</button>
          <p className="disclaimer">This is a paper trade using virtual funds. It does not place an order on an exchange.</p>
        </form>
      </div>
    </div>
  );
}
