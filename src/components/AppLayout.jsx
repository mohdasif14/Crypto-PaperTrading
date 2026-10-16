import { Link, NavLink, useLocation } from "react-router-dom";
import { Activity, LayoutDashboard, Star, BriefcaseBusiness, History as HistoryIcon, RotateCcw } from "lucide-react";
import { fmt } from "../data/marketData";
import { useTrading } from "../context/TradingContext";

export default function AppLayout({ children }) {
  const { account, resetAccount } = useTrading();
  const location = useLocation();
  const currentPage = location.pathname.startsWith("/coin/") ? "Coin details" : ({ "/": "Markets", "/watchlist": "Watchlist", "/portfolio": "Portfolio", "/history": "Trade history" }[location.pathname] || "Markets");
  const nav = [["/", "Markets", LayoutDashboard], ["/watchlist", "Watchlist", Star], ["/portfolio", "Portfolio", BriefcaseBusiness], ["/history", "History", HistoryIcon]];
  const reset = () => { if (window.confirm("Reset the account to $10,000 and erase all simulated trades?")) resetAccount(); };

  return <div className="shell">
    <aside className="sidebar">
      <Link className="brand" to="/" aria-label="CoinPilot home"><span className="brand-icon"><Activity /></span><span>coin<span className="purple">pilot</span><small>PAPER TRADING</small></span></Link>
      <div className="navlabel">WORKSPACE</div>
      <nav aria-label="Main navigation">{nav.map(([to, label, Icon]) => <NavLink end={to === "/"} key={to} to={to} className={({ isActive }) => "navlink " + (isActive ? "active" : "")}><Icon size={18} />{label}</NavLink>)}</nav>
      <div className="sidebottom"><div className="cashbox"><small>● VIRTUAL ACCOUNT</small><strong>{fmt(account.cash)}</strong><span>Available to trade</span></div><button className="reset" onClick={reset}><RotateCcw size={15} /> Reset account</button><p>Practice trading with virtual funds. No real money involved.</p></div>
    </aside>
    <div className="main">
      <header className="topbar"><span className="pagecrumb"><i /> {currentPage.toUpperCase()}</span><span className="user"><span className="avatar">P</span><b>Paper account</b><span className="market-status">SIMULATED</span></span></header>
      <main>{children}</main>
      <footer>CoinPilot · Educational paper-trading simulator · Not financial advice</footer>
    </div>
  </div>;
}
