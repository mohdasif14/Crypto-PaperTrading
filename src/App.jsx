import { useCallback, useEffect, useRef, useState } from "react";
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
  const [coins, setCoins] = useState([]);
  const [source, setSource] = useState("loading");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [apiError, setApiError] = useState("");
  const lastGoodResult = useRef(null);
  const requestInProgress = useRef(false);

  const reload = useCallback(async ({ force = true } = {}) => {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    setLoading(true);
    setLastAttempt(new Date());
    try {
      const result = await getMarkets({ force });
      if (result.source === "coingecko" || result.source === "binance") {
        lastGoodResult.current = result;
        setCoins(result.coins);
        setSource(result.source);
        setApiError(result.error || "");
        setLastUpdated(new Date(result.updatedAt || Date.now()));
      } else if (lastGoodResult.current) {
        // Keep the last successful live prices, but clearly mark them stale.
        setCoins(lastGoodResult.current.coins);
        setSource("stale");
        setApiError(`${result.error} Showing the last successful live prices, which may now be stale.`);
      } else {
        setCoins([]);
        setSource("offline");
        setApiError(result.error || "Live providers could not be reached.");
      }
    } catch (error) {
      const message = error?.message || "Unexpected market-data error.";
      if (lastGoodResult.current) {
        setCoins(lastGoodResult.current.coins);
        setSource("stale");
      } else {
        setCoins([]);
        setSource("offline");
      }
      setApiError(`${message} No new live prices were received.`);
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload({ force: false });
    const timer = window.setInterval(() => reload({ force: true }), 30_000);
    return () => window.clearInterval(timer);
  }, [reload]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Markets coins={coins} source={source} reload={reload} loading={loading} lastUpdated={lastUpdated} lastAttempt={lastAttempt} apiError={apiError} />} />
        <Route path="/coin/:id" element={<CoinDetails coins={coins} source={source} reload={reload} loading={loading} lastUpdated={lastUpdated} />} />
        <Route path="/watchlist" element={<Watchlist coins={coins} source={source} />} />
        <Route path="/portfolio" element={<Portfolio coins={coins} />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Markets coins={coins} source={source} reload={reload} loading={loading} lastUpdated={lastUpdated} lastAttempt={lastAttempt} apiError={apiError} />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return <TradingProvider><DashboardRoutes /></TradingProvider>;
}
