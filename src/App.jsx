import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { TradingProvider } from "./context/TradingContext";
import { getMarkets } from "./data/marketData";
import Markets from "./pages/Markets";
import Watchlist from "./pages/Watchlist";
import Portfolio from "./pages/Portfolio";
import History from "./pages/History";
import CoinDetails from "./pages/CoinDetails";
function DashboardRoutes() {
  const [coins, setCoins] = useState([]), [source, setSource] = useState("loading"), [loading, setLoading] = useState(true), [lastUpdated, setLastUpdated] = useState(null);
  const reload = async () => {
    setLoading(true);
    try {
      const result = await getMarkets();
      setCoins(result.coins);
      setSource(result.source);
      setLastUpdated(new Date());
    } finally { setLoading(false); }
  };
  useEffect(() => {
    reload();
    const timer = window.setInterval(() => { reload(); }, 30000);
    return () => window.clearInterval(timer);
  }, []);
  return <AppLayout><Routes><Route path="/" element={<Markets coins={coins} source={source} reload={reload} loading={loading} lastUpdated={lastUpdated} />} /><Route path="/coin/:id" element={<CoinDetails coins={coins} />} /><Route path="/watchlist" element={<Watchlist coins={coins} />} /><Route path="/portfolio" element={<Portfolio coins={coins} />} /><Route path="/history" element={<History />} /><Route path="*" element={<Markets coins={coins} source={source} reload={reload} loading={loading} lastUpdated={lastUpdated} />} /></Routes></AppLayout>;
}
export default function App() { return <TradingProvider><DashboardRoutes /></TradingProvider>; }
