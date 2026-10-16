import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RefreshCw } from "lucide-react";
import { fmt } from "../data/marketData";

const ranges = [{ days: 1, label: "24H" }, { days: 7, label: "7D" }, { days: 30, label: "30D" }, { days: 90, label: "90D" }];

function formatTick(value, days) {
  const date = new Date(Number(value));
  if (!Number.isFinite(date.getTime())) return "";
  if (days === 1) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function PriceChart({ data = [], days, onDaysChange, loading = false, chartSource = "", chartError = "", onRetry }) {
  const validData = data.filter((point) => Number.isFinite(Number(point.time)) && Number.isFinite(Number(point.price)) && Number(point.price) > 0);
  const startPrice = validData[0]?.price;
  const endPrice = validData[validData.length - 1]?.price;
  const change = startPrice && endPrice ? ((endPrice - startPrice) / startPrice) * 100 : null;
  const lineColor = change == null || change >= 0 ? "#3bd6a0" : "#ff7188";
  const sourceLabel = chartSource === "coingecko" ? "CoinGecko" : chartSource === "binance" ? "Binance" : "";

  return (
    <section className="panel chartpanel">
      <div className="panelhead chart-head">
        <div><div className="chart-title-row"><h2>Price history</h2>{sourceLabel && <span className="chart-source-dot"><i />{sourceLabel}</span>}</div><p>{days === 1 ? "Last 24 hours · local time" : `Last ${days} days · calendar dates`}{change != null && <span className={change >= 0 ? "green chart-change" : "redtext chart-change"}> {change >= 0 ? "+" : ""}{change.toFixed(2)}% in range</span>}</p></div>
        <div className="chart-controls"><div className="period" role="group" aria-label="Historical chart range">{ranges.map((range) => <button key={range.days} className={days === range.days ? "on" : ""} aria-pressed={days === range.days} onClick={() => onDaysChange(range.days)}>{range.label}</button>)}</div><button className="chart-retry" onClick={onRetry} disabled={loading} title="Reload chart data" aria-label="Reload chart data"><RefreshCw size={15} /></button></div>
      </div>
      <div className="chart">
        {loading ? <div className="chart-state"><div className="loader-orb" /><strong>Loading historical candles</strong><span>Requesting actual price timestamps from market-data APIs.</span></div> : validData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={validData} margin={{ top: 12, right: 20, left: 6, bottom: 4 }}>
              <defs><linearGradient id="coinpilotPriceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lineColor} stopOpacity={0.26} /><stop offset="90%" stopColor={lineColor} stopOpacity={0.01} /></linearGradient></defs>
              <CartesianGrid stroke="#263149" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="time" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={(value) => formatTick(value, days)} tick={{ fill: "#8e9bb5", fontSize: 10 }} minTickGap={42} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "#8e9bb5", fontSize: 10 }} axisLine={false} tickLine={false} width={86} tickFormatter={(value) => fmt(value)} tickCount={5} />
              <Tooltip labelFormatter={(value) => new Date(Number(value)).toLocaleString()} contentStyle={{ background: "#111a2c", border: "1px solid #34415b", borderRadius: 12, color: "#edf2ff", boxShadow: "0 12px 36px #0005" }} labelStyle={{ color: "#aab6ce", fontSize: 11, marginBottom: 5 }} formatter={(value) => [fmt(value), "Price"]} />
              {endPrice && <ReferenceLine y={endPrice} stroke={lineColor} strokeDasharray="4 4" strokeOpacity={0.55} />}
              <Area type="monotone" dataKey="price" name="Price" stroke={lineColor} fill="url(#coinpilotPriceFill)" strokeWidth={2.4} activeDot={{ r: 4, stroke: lineColor, strokeWidth: 2, fill: "#111a2c" }} isAnimationActive={false} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <div className="chart-state chart-error"><strong>Historical chart unavailable</strong><span>{chartError || "The API returned no usable data. No sample history is substituted."}</span><button className="btn secondary" onClick={onRetry} disabled={loading}>Try again</button></div>}
      </div>
      <div className="panelfoot chart-foot">{sourceLabel ? `Historical data provided by ${sourceLabel}.` : "No historical data provider has returned valid candles."} {days === 1 ? "Intraday candles are grouped by time." : "Candles are plotted at their actual timestamps."}</div>
    </section>
  );
}
