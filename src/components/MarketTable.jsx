import { useNavigate } from "react-router-dom";
import { Star, ArrowUpRight } from "lucide-react";
import { fmt, pct } from "../data/marketData";

export default function MarketTable({ coins = [], watchlist = [], onToggle }) {
  const navigate = useNavigate();
  const openCoin = (id) => navigate(`/coin/${encodeURIComponent(id)}`);

  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr><th>ASSET</th><th>PRICE</th><th>24H CHANGE</th><th>MARKET CAP</th><th>24H VOLUME</th><th aria-label="Actions" /></tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr
              key={coin.id}
              className="market-row-clickable"
              onClick={() => openCoin(coin.id)}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openCoin(coin.id); } }}
              tabIndex={0}
              aria-label={`Open ${coin.name} details`}
              title={`View ${coin.name} details`}
            >
              <td><div className="asset"><span className="rank">{coin.market_cap_rank ?? "—"}</span><img src={coin.image} alt="" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} /><div><strong>{coin.name}</strong><small>{(coin.symbol || "").toUpperCase()}</small></div></div></td>
              <td>{fmt(coin.current_price)}</td>
              <td><span className={`pill ${coin.price_change_percentage_24h >= 0 ? "up" : "down"}`}>{pct(coin.price_change_percentage_24h)}</span></td>
              <td className="muted">{fmt(coin.market_cap, true)}</td>
              <td className="muted">{fmt(coin.total_volume, true)}</td>
              <td><div className="market-actions"><button className={`star ${watchlist.includes(coin.id) ? "selected" : ""}`} onClick={(e) => { e.stopPropagation(); onToggle(coin.id); }} aria-label={`Toggle ${coin.name} watchlist`} title="Add to watchlist"><Star size={17} fill={watchlist.includes(coin.id) ? "currentColor" : "none"} /></button><ArrowUpRight size={15} className="row-open-icon" /></div></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!coins.length && <div className="empty"><h3>No coins found</h3><p>Try another search or star coins from Markets.</p></div>}
      <style>{`.market-row-clickable{cursor:pointer}.market-row-clickable:hover{background:rgba(120,140,180,.09)}.market-row-clickable:focus-visible{outline:2px solid var(--accent,#7c8cff);outline-offset:-2px}.market-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px}.row-open-icon{opacity:.45}.market-row-clickable:hover .row-open-icon{opacity:1}`}</style>
    </div>
  );
}
