import { useMemo, useState } from "react";
import { RefreshCw, Search, Radio, Clock3 } from "lucide-react";
import { fmt } from "../data/marketData";
import { useTrading } from "../context/TradingContext";
import StatCard from "../components/StatCard";
import MarketTable from "../components/MarketTable";

const sourceLabel = (source) => ({
  coingecko: "COINGECKO LIVE",
  binance: "BINANCE LIVE",
  stale: "LAST LIVE DATA · STALE",
  loading: "CONNECTING…",
  offline: "NO LIVE DATA",
})[source] || "DATA STATUS UNKNOWN";

export default function Markets({ coins, source, reload, loading, lastUpdated, lastAttempt, apiError }) {
  const { account, toggleWatchlist } = useTrading();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("market_cap_rank");
  const filtered = useMemo(() => coins
    .filter((coin) => !query || coin.name.toLowerCase().includes(query.toLowerCase()) || coin.symbol.toLowerCase().includes(query.toLowerCase()))
    .slice()
    .sort((a, b) => {
      if (sort === "market_cap_rank") {
        if (a.market_cap_rank == null && b.market_cap_rank == null) return (a.catalog_order ?? 0) - (b.catalog_order ?? 0);
        if (a.market_cap_rank == null) return 1;
        if (b.market_cap_rank == null) return -1;
        return a.market_cap_rank - b.market_cap_rank;
      }
      return (Number(b[sort]) || 0) - (Number(a[sort]) || 0);
    }), [coins, query, sort]);

  const submitRefresh = () => reload({ force: true });
  const marketCapAvailable = coins.some((coin) => coin.market_cap != null);
  const sourceClass = source === "coingecko" || source === "binance" ? "live" : source === "stale" ? "stale" : source === "offline" ? "offline" : "neutral";

  return (
    <div className="stack">
      <div className="heading market-heading">
        <div><small className="eyebrow">MARKET OVERVIEW</small><h1>Explore markets<span className="title-dot">.</span></h1><p>Live prices when a data provider is available. Trades use virtual money only.</p></div>
        <button className="btn primary refresh-btn" onClick={submitRefresh} disabled={loading}>
          <RefreshCw size={16} className={loading ? "spin" : ""} />{loading ? "Updating prices…" : "Refresh prices"}
        </button>
      </div>

      <div className="market-live-strip">
        <span className={`source-dot ${sourceClass}`} />
        <div className="live-strip-copy"><strong>{sourceLabel(source)}</strong><small>{source === "offline" ? "No prices are shown because neither provider returned live data." : source === "stale" ? "The latest refresh failed; keeping the last successful live prices." : source === "loading" ? "Connecting to public market data providers." : "Prices are from a public market-data API."}</small></div>
        <div className="update-meta"><span><Clock3 size={13} /> Last successful update</span><strong>{lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Not yet"}</strong></div>
      </div>

      {(source === "stale" || source === "offline" || apiError) && <div className={`notice ${source === "stale" ? "notice-stale" : ""}`}><strong>{source === "stale" ? "Live refresh failed." : source === "offline" ? "Live data is unavailable." : "Market data notice."}</strong> {apiError} {lastAttempt && <span> Last attempt: {lastAttempt.toLocaleTimeString()}.</span>} <button onClick={submitRefresh} disabled={loading}>Try again</button></div>}

      <div className="stats">
        <StatCard label="Assets shown" value={coins.length || "—"} hint={source === "offline" ? "No live provider response" : "Market pairs loaded"} />
        <StatCard label="Virtual cash" value={fmt(account.cash)} hint="Available to trade" />
        <StatCard label="Watchlist" value={account.watchlist.length} hint="Saved assets" />
        <StatCard label="Market cap" value={marketCapAvailable ? fmt(coins.reduce((sum, coin) => sum + (Number(coin.market_cap) || 0), 0), true) : "Not provided"} hint={marketCapAvailable ? "Sum of displayed assets" : "Unavailable from price fallback"} />
      </div>

      <section className="panel market-panel">
        <div className="panelhead"><div><h2>Cryptocurrency market</h2><p>Click a row to inspect its price history and simulate a trade.</p></div><span className={`badge ${sourceClass}`}><Radio size={12} /> {sourceLabel(source)}</span></div>
        <div className="toolbar"><div className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by coin name or symbol…" /></div><label>Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="market_cap_rank">Market cap rank</option><option value="current_price">Price: high to low</option><option value="market_cap" disabled={!marketCapAvailable}>Market cap{marketCapAvailable ? "" : " (unavailable)"}</option><option value="price_change_percentage_24h">24h change</option></select></label></div>
        {loading && !coins.length ? <div className="empty"><div className="loader-orb" /><h3>Connecting to market data</h3><p>Trying CoinGecko, then Binance public prices.</p></div> : source === "offline" && !coins.length ? <div className="empty live-offline"><div className="offline-symbol"><Radio size={22} /></div><h3>Could not connect to live prices</h3><p>Neither CoinGecko nor Binance returned market data. We are not showing made-up prices. Check your internet access, then retry.</p><button className="btn primary" onClick={submitRefresh} disabled={loading}><RefreshCw size={14} /> Try live providers again</button></div> : <MarketTable coins={filtered} watchlist={account.watchlist} onToggle={toggleWatchlist} />}
        <div className="panelfoot">Auto-refresh: every 30 seconds. Public APIs can be temporarily unavailable or rate-limited. The source badge tells you whether displayed prices are live, stale, or unavailable.</div>
      </section>
    </div>
  );
}
