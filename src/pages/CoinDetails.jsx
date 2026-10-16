import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, RefreshCw, TrendingUp, Activity } from "lucide-react";
import { fmt, num, pct, getHistoricalPrices } from "../data/marketData";
import { useTrading } from "../context/TradingContext";
import TradeModal from "../components/TradeModal";
import PriceChart from "../components/PriceChart";

export default function CoinDetails({ coins, source, reload, loading: marketLoading, lastUpdated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, toggleWatchlist, trade } = useTrading();
  const [side, setSide] = useState("");
  const [chart, setChart] = useState([]);
  const [days, setDays] = useState(7);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartSource, setChartSource] = useState("");
  const [chartError, setChartError] = useState("");
  const [chartVersion, setChartVersion] = useState(0);
  const [refreshMessage, setRefreshMessage] = useState("");

  const coin = coins.find((item) => item.id === id);

  useEffect(() => {
    let active = true;
    setChartLoading(true);
    setChartError("");
    setChartSource("");
    setChart([]);
    getHistoricalPrices(id, days, { force: chartVersion > 0 })
      .then((result) => {
        if (!active) return;
        setChart(result.data);
        setChartSource(result.source);
        if (result.data.length < 2) setChartError("The provider returned too few data points for this range.");
      })
      .catch((error) => {
        if (!active) return;
        setChartError(error?.message || "Historical prices could not be loaded. Check your internet connection and retry.");
      })
      .finally(() => { if (active) setChartLoading(false); });
    return () => { active = false; };
  }, [id, days, chartVersion]);

  if (!coin) {
    return <div className="empty page-empty"><h3>Coin not found</h3><p>{source === "offline" ? "Live market providers are unavailable. No fixed sample price is substituted." : "This asset is not in the latest market response."}</p><button className="btn secondary" onClick={() => reload({ force: true })}>Retry live data</button><button className="btn primary" onClick={() => navigate("/")}>Back to markets</button></div>;
  }

  const holding = account.holdings[id];
  const change = Number(coin.price_change_percentage_24h) || 0;
  const handleRefresh = async () => {
    setRefreshMessage("Requesting latest prices…");
    await reload({ force: true });
    setChartVersion((value) => value + 1);
    setRefreshMessage("Refresh request completed. Check the data source on Markets if prices did not update.");
    window.setTimeout(() => setRefreshMessage(""), 5000);
  };
  const chartProvider = chartSource === "coingecko" ? "CoinGecko" : chartSource === "binance" ? "Binance" : "—";
  const quoteProvider = source === "coingecko" ? "COINGECKO LIVE" : source === "binance" ? "BINANCE LIVE" : source === "stale" ? "LAST LIVE QUOTE · STALE" : source === "offline" ? "LIVE QUOTE UNAVAILABLE" : "WAITING FOR MARKET DATA";

  return (
    <div className="stack coin-page">
      <div className="coin-page-toolbar">
        <Link className="back" to="/"><ArrowLeft size={15} /> Back to markets</Link>
        <button className="btn secondary" onClick={handleRefresh} disabled={marketLoading}><RefreshCw size={15} className={marketLoading ? "spin" : ""} /> Refresh price</button>
      </div>
      {refreshMessage && <div className="inline-status">{refreshMessage}</div>}
      <div className="coinhead coin-head-card">
        <div className="coinhero"><img src={coin.image} alt="" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /><div><small className="eyebrow">ASSET OVERVIEW</small><h1>{coin.name} <span>{coin.symbol.toUpperCase()}</span></h1><small className={change >= 0 ? "green" : "redtext"}><TrendingUp size={13} /> {pct(change)} over 24 hours</small></div></div>
        <div className="actions"><button className="btn secondary" onClick={() => toggleWatchlist(id)}><Star size={15} fill={account.watchlist.includes(id) ? "currentColor" : "none"} />{account.watchlist.includes(id) ? "Saved" : "Add to watchlist"}</button><button className="btn primary" onClick={() => setSide("buy")}>Buy {coin.symbol.toUpperCase()}</button><button className="btn red" onClick={() => setSide("sell")}>Sell</button></div>
      </div>
      <div className="pricecard coin-pricecard">
        <div><small className="eyebrow">MARKET PRICE</small><strong>{fmt(coin.current_price)}</strong><span className={`pill ${change >= 0 ? "up" : "down"}`}>{pct(change)} <small>24H</small></span><span className={`quote-source ${source === "coingecko" || source === "binance" ? "quote-live" : source === "offline" ? "quote-offline" : "quote-stale"}`}>{quoteProvider}</span><small className="price-asof">{lastUpdated ? `Last successful market response ${lastUpdated.toLocaleTimeString()}` : "No successful live market response yet"}</small></div>
        <div><small>Your position</small><b>{num(holding?.quantity || 0)} {coin.symbol.toUpperCase()}</b><small>Current value: {fmt((holding?.quantity || 0) * coin.current_price)}</small></div>
      </div>
      <PriceChart data={chart} days={days} onDaysChange={setDays} loading={chartLoading} chartSource={chartSource} chartError={chartError} onRetry={() => setChartVersion((value) => value + 1)} />
      <div className="chart-provider-note"><Activity size={14} /> Historical source: <strong>{chartProvider}</strong>{chartSource === "binance" && <span> · Exchange spot candles for a USDT pair</span>}{chartSource === "coingecko" && <span> · Aggregated crypto market history</span>}</div>
      <div className="detailstats">{[["Market cap", fmt(coin.market_cap, true)], ["24h volume", fmt(coin.total_volume, true)], ["24h high", fmt(coin.high_24h)], ["24h low", fmt(coin.low_24h)], ["Circulating supply", num(coin.circulating_supply)], ["24h change", pct(change)]].map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      {side && <TradeModal coin={coin} side={side} account={account} trade={trade} onClose={() => setSide("")} />}
    </div>
  );
}
