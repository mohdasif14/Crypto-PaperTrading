import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { fmt } from "../data/marketData";
export default function PriceChart({ data = [], days, onDaysChange, loading = false, chartSource = "live", chartError = "" }) {
  const formatTick = (value) => {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return String(value ?? "");
    return days === 1
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
  };
  return <section className="panel chartpanel"><div className="panelhead"><div><h2>Price history</h2><p>{days === 1 ? "Last 24 hours · time shown in your local timezone" : `Last ${days} days · calendar dates shown`}</p></div><div className="period">{[{d:1,label:"24H"},{d:7,label:"7D"},{d:30,label:"30D"},{d:90,label:"90D"}].map(({d,label}) => <button className={days === d ? "on" : ""} key={d} onClick={() => onDaysChange(d)}>{label}</button>)}</div></div>
  <div className="chart">{loading ? <div className="empty">Loading historical prices…</div> : data.length > 1 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{top:8,right:14,left:4,bottom:4}}><defs><linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b7cff" stopOpacity={0.32}/><stop offset="95%" stopColor="#8b7cff" stopOpacity={0.015}/></linearGradient></defs><CartesianGrid stroke="#252d43" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="time" tickFormatter={formatTick} tick={{fill:"#8d96ad",fontSize:10}} minTickGap={32} axisLine={false} tickLine={false}/><YAxis domain={["auto","auto"]} tick={{fill:"#8d96ad",fontSize:10}} axisLine={false} tickLine={false} width={76} tickFormatter={(v)=>fmt(v)}/><Tooltip labelFormatter={(v)=>new Date(v).toLocaleString()} contentStyle={{background:"#151c31",border:"1px solid #303952",borderRadius:10}} formatter={(v)=>[fmt(v),"Price"]}/><Area type="monotone" dataKey="price" stroke="#9b8cff" fill="url(#priceFill)" strokeWidth={2.5} activeDot={{r:4,strokeWidth:0}} isAnimationActive={false}/></AreaChart></ResponsiveContainer> : <div className="empty"><h3>Historical data unavailable</h3><p>{chartError || "The provider did not return enough data for this range. Try again in a moment."}</p></div>}</div><div className="panelfoot">{chartSource === "demo" ? "Illustrative demo history — not live historical prices." : "Historical prices from CoinGecko when available."}</div></section>;
}
