import { useTrading } from "../context/TradingContext";
import MarketTable from "../components/MarketTable";
export default function Watchlist({ coins }) {
  const { account, toggleWatchlist } = useTrading();
  const watched = account.watchlist.map((id) => coins.find((c) => c.id === id)).filter(Boolean);
  return <div className="stack"><div className="heading"><div><small className="eyebrow">YOUR SAVED ASSETS</small><h1>Watchlist <em>.</em></h1><p>Keep your favourite assets close at hand.</p></div></div><section className="panel"><div className="panelhead"><div><h2>Watched coins</h2><p>Star any coin from Markets to add it here. Only coins with a current market-data response are shown.</p></div></div><MarketTable coins={watched} watchlist={account.watchlist} onToggle={toggleWatchlist} /></section></div>;
}
