import { Link } from "react-router-dom";
import { History as HistoryIcon } from "lucide-react";
import { fmt, num } from "../data/marketData";
import { useTrading } from "../context/TradingContext";
export default function History() {
  const { account } = useTrading();
  return <div className="stack"><div className="heading"><div><small className="eyebrow">YOUR ACTIVITY</small><h1>Transaction history <em>.</em></h1><p>A record of every simulated buy and sell order.</p></div></div><section className="panel"><div className="panelhead"><div><h2>All transactions</h2><p>Newest transactions appear first.</p></div></div>{!account.transactions.length ? <div className="empty"><HistoryIcon size={26} /><h3>No transactions yet</h3><p>Your trades appear here after you buy or sell an asset.</p><Link className="btn primary" to="/">Explore markets</Link></div> : <div className="tablewrap"><table><thead><tr><th>TYPE</th><th>ASSET</th><th>DATE</th><th>QUANTITY</th><th>PRICE</th><th>TOTAL</th></tr></thead><tbody>{account.transactions.map((t) => <tr key={t.id}><td className={t.side === "buy" ? "green" : "redtext"}>{t.side.toUpperCase()}</td><td>{t.name}<small>{t.symbol.toUpperCase()}</small></td><td>{new Date(t.date).toLocaleString()}</td><td>{num(t.quantity)}</td><td>{fmt(t.price)}</td><td>{fmt(t.total)}</td></tr>)}</tbody></table></div>}</section></div>;
}
