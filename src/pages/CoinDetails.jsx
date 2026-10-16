import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { demoCoins, fmt, num, pct } from "../data/marketData";
import { useTrading } from "../context/TradingContext";
import TradeModal from "../components/TradeModal";
import PriceChart from "../components/PriceChart";
export default function CoinDetails({ coins }) {
  const { id } = useParams(), navigate = useNavigate(), { account, toggleWatchlist, trade } = useTrading();
  const [side, setSide] = useState(""), [chart, setChart] = useState([]), [days, setDays] = useState(7), [liveCoin, setLiveCoin] = useState(null), [chartLoading, setChartLoading] = useState(true), [chartSource, setChartSource] = useState("live"), [chartError, setChartError] = useState("");
  const coin = liveCoin || coins.find((c) => c.id === id) || demoCoins.find((c) => c.id === id);
  useEffect(() => {
    let active = true;
    setChartLoading(true); setChartError(""); setChart([]); setChartSource("live");
    const controller = new AbortController();
    fetch(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`, { signal: controller.signal, headers: { accept: "application/json" } })
      .then((r) => { if (!r.ok) throw new Error(`Historical API returned ${r.status}`); return r.json(); })
      .then((d) => { if (active) { const prices = (d.prices || []).map(([t, p]) => ({ time: t, price: p })); setChart(prices); if (!prices.length) setChartError("No historical prices were returned for this range."); } })
      .catch((e) => { if (active && e.name !== "AbortError") setChartError(e.message.includes("429") ? "CoinGecko rate limit reached. Wait a little and try again." : "Could not load historical prices. Check your connection or try again later."); })
      .finally(() => { if (active) setChartLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [id, days]);
  useEffect(() => { let active = true; fetch(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`).then((r) => { if (!r.ok) throw Error(); return r.json(); }).then((d) => { if (active) setLiveCoin({ id: d.id, name: d.name, symbol: d.symbol, image: d.image?.large, current_price: d.market_data.current_price.usd, market_cap: d.market_data.market_cap.usd, total_volume: d.market_data.total_volume.usd, high_24h: d.market_data.high_24h.usd, low_24h: d.market_data.low_24h.usd, price_change_percentage_24h: d.market_data.price_change_percentage_24h, circulating_supply: d.market_data.circulating_supply }); }).catch(() => {}); return () => { active = false; }; }, [id]);
  if (!coin) return <div className="empty"><p>Coin not found.</p><button className="btn primary" onClick={() => navigate("/")}>Back to markets</button></div>;
  const holding = account.holdings[id], change = coin.price_change_percentage_24h || 0;
  return <div className="stack"><Link className="back" to="/"><ArrowLeft size={15} /> Back to markets</Link><div className="coinhead"><div className="coinhero"><img src={coin.image} alt="" /><div><small className="eyebrow">ASSET OVERVIEW</small><h1>{coin.name} <span>{coin.symbol.toUpperCase()}</span></h1><small className={change >= 0 ? "green" : "redtext"}>{pct(change)} today</small></div></div><div className="actions"><button className="btn secondary" onClick={() => toggleWatchlist(id)}><Star size={15} fill={account.watchlist.includes(id) ? "currentColor" : "none"} />{account.watchlist.includes(id) ? "Watchlisted" : "Watchlist"}</button><button className="btn primary" onClick={() => setSide("buy")}>Buy</button><button className="btn red" onClick={() => setSide("sell")}>Sell</button></div></div><div className="pricecard"><div><small className="eyebrow">CURRENT PRICE</small><strong>{fmt(coin.current_price)}</strong><span className={`pill ${change >= 0 ? "up" : "down"}`}>{pct(change)} <small>past 24 hours</small></span></div><div><small>Your holding</small><b>{num(holding?.quantity || 0)} {coin.symbol.toUpperCase()}</b><small>Value: {fmt((holding?.quantity || 0) * coin.current_price)}</small></div></div><PriceChart data={chart} days={days} onDaysChange={setDays} loading={chartLoading} chartSource={chartSource} chartError={chartError} /><div className="detailstats">{[["Market cap", fmt(coin.market_cap, true)], ["24h volume", fmt(coin.total_volume, true)], ["24h high", fmt(coin.high_24h)], ["24h low", fmt(coin.low_24h)], ["Circulating supply", num(coin.circulating_supply)], ["24h change", pct(change)]].map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>{side && <TradeModal coin={coin} side={side} account={account} trade={trade} onClose={() => setSide("")} />}</div>;
}
