// CoinPilot market data layer.
// Primary source: CoinGecko. Live-price fallback: Binance public spot market data.
// If both live providers fail, the UI shows an offline state rather than substituting hardcoded prices.

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const BINANCE_BASES = ["https://data-api.binance.vision", "https://api.binance.com"];
const CACHE_MS = 12_000;

export const cryptoCatalog = [
  { id: "bitcoin", name: "Bitcoin", symbol: "btc", pair: "BTCUSDT", image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { id: "ethereum", name: "Ethereum", symbol: "eth", pair: "ETHUSDT", image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { id: "binancecoin", name: "BNB", symbol: "bnb", pair: "BNBUSDT", image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
  { id: "solana", name: "Solana", symbol: "sol", pair: "SOLUSDT", image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { id: "ripple", name: "XRP", symbol: "xrp", pair: "XRPUSDT", image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
  { id: "dogecoin", name: "Dogecoin", symbol: "doge", pair: "DOGEUSDT", image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { id: "cardano", name: "Cardano", symbol: "ada", pair: "ADAUSDT", image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  { id: "tron", name: "TRON", symbol: "trx", pair: "TRXUSDT", image: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png" },
  { id: "chainlink", name: "Chainlink", symbol: "link", pair: "LINKUSDT", image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png" },
  { id: "avalanche-2", name: "Avalanche", symbol: "avax", pair: "AVAXUSDT", image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png" },
  { id: "litecoin", name: "Litecoin", symbol: "ltc", pair: "LTCUSDT", image: "https://assets.coingecko.com/coins/images/2/large/litecoin.png" },
  { id: "bitcoin-cash", name: "Bitcoin Cash", symbol: "bch", pair: "BCHUSDT", image: "https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png" },
  { id: "polkadot", name: "Polkadot", symbol: "dot", pair: "DOTUSDT", image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png" },
  { id: "stellar", name: "Stellar", symbol: "xlm", pair: "XLMUSDT", image: "https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png" },
  { id: "uniswap", name: "Uniswap", symbol: "uni", pair: "UNIUSDT", image: "https://assets.coingecko.com/coins/images/12504/large/uni.jpg" },
  { id: "near", name: "NEAR Protocol", symbol: "near", pair: "NEARUSDT", image: "https://assets.coingecko.com/coins/images/10365/large/near.jpg" },
  { id: "shiba-inu", name: "Shiba Inu", symbol: "shib", pair: "SHIBUSDT", image: "https://assets.coingecko.com/coins/images/11939/large/shiba.png" },
  { id: "aptos", name: "Aptos", symbol: "apt", pair: "APTUSDT", image: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png" },
  { id: "sui", name: "Sui", symbol: "sui", pair: "SUIUSDT", image: "https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg" },
  { id: "pepe", name: "Pepe", symbol: "pepe", pair: "PEPEUSDT", image: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg" },
];

export const fmt = (value, compact = false) => {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", notation: compact ? "compact" : "standard",
    maximumFractionDigits: Math.abs(Number(value)) < 1 ? 6 : 2,
  }).format(Number(value));
};
export const num = (value) => {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 }).format(Number(value));
};
export const pct = (value) => `${Number(value) > 0 ? "+" : ""}${Number(value || 0).toFixed(2)}%`;

async function fetchJson(url, timeoutMs = 10_000) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}${response.status === 429 ? " (rate limited)" : ""}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

let marketInFlight = null;
let lastMarketSuccess = null;
let lastMarketSuccessAt = 0;

async function getCoinGeckoMarkets() {
  const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`;
  const data = await fetchJson(url);
  if (!Array.isArray(data) || data.length === 0) throw new Error("CoinGecko returned no market data");
  return data;
}

async function getBinanceMarkets() {
  const catalog = cryptoCatalog.filter((coin) => coin.pair);
  const pairs = catalog.map((coin) => coin.pair);
  const url = `${BINANCE_BASES[0]}/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(pairs))}`;
  let data;
  try {
    data = await fetchJson(url);
  } catch (firstError) {
    const fallbackUrl = `${BINANCE_BASES[1]}/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(pairs))}`;
    try { data = await fetchJson(fallbackUrl); } catch { throw firstError; }
  }
  if (!Array.isArray(data) || data.length === 0) throw new Error("Binance returned no ticker data");
  const byPair = new Map(data.map((ticker) => [ticker.symbol, ticker]));
  const coins = catalog.map((meta) => {
    const ticker = byPair.get(meta.pair);
    if (!ticker || !Number.isFinite(Number(ticker.lastPrice))) return null;
    return {
      id: meta.id, name: meta.name, symbol: meta.symbol, image: meta.image, catalog_order: catalog.indexOf(meta),
      current_price: Number(ticker.lastPrice),
      market_cap: null, market_cap_rank: null,
      total_volume: Number(ticker.quoteVolume || 0),
      price_change_percentage_24h: Number(ticker.priceChangePercent || 0),
      high_24h: Number(ticker.highPrice || 0), low_24h: Number(ticker.lowPrice || 0),
      circulating_supply: null, pair: meta.pair,
    };
  }).filter(Boolean);
  if (coins.length < 3) throw new Error("Binance returned too few supported trading pairs");
  return coins;
}

export async function getMarkets({ force = false } = {}) {
  if (!force && lastMarketSuccess && Date.now() - lastMarketSuccessAt < CACHE_MS) return lastMarketSuccess;
  if (marketInFlight) return marketInFlight;

  marketInFlight = (async () => {
    let coinGeckoError = "";
    try {
      const coins = await getCoinGeckoMarkets();
      const result = { coins, source: "coingecko", error: "", updatedAt: Date.now() };
      lastMarketSuccess = result;
      lastMarketSuccessAt = Date.now();
      return result;
    } catch (error) {
      coinGeckoError = `CoinGecko unavailable: ${error.message || "request failed"}.`;
    }

    try {
      const coins = await getBinanceMarkets();
      const result = { coins, source: "binance", error: "", updatedAt: Date.now() };
      lastMarketSuccess = result;
      lastMarketSuccessAt = Date.now();
      return result;
    } catch (error) {
      return {
        coins: [],
        source: "offline",
        error: `${coinGeckoError} Binance unavailable: ${error.message || "request failed"}. No fixed sample prices are displayed because neither live provider responded.`,
        updatedAt: null,
      };
    }
  })().finally(() => { marketInFlight = null; });

  return marketInFlight;
}

const symbolById = new Map(cryptoCatalog.map((coin) => [coin.id, coin.pair]));
async function getBinanceHistory(id, days) {
  const pair = symbolById.get(id);
  if (!pair) throw new Error("This coin does not have a supported Binance spot pair for chart fallback.");
  const config = days <= 1 ? { interval: "5m", limit: 288 } : days <= 7 ? { interval: "1h", limit: 168 } : days <= 30 ? { interval: "4h", limit: 180 } : { interval: "1d", limit: 90 };
  const params = new URLSearchParams({ symbol: pair, interval: config.interval, limit: String(config.limit) });
  let rows;
  try {
    rows = await fetchJson(`${BINANCE_BASES[0]}/api/v3/klines?${params}`);
  } catch (firstError) {
    try { rows = await fetchJson(`${BINANCE_BASES[1]}/api/v3/klines?${params}`); }
    catch { throw firstError; }
  }
  const points = (Array.isArray(rows) ? rows : []).map((row) => ({ time: Number(row[0]), price: Number(row[4]), volume: Number(row[5]) }))
    .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.price) && point.price > 0);
  if (points.length < 2) throw new Error("Binance returned too little chart data");
  return { data: points, source: "binance", interval: config.interval };
}

const historyCache = new Map();
const historyInFlight = new Map();
async function loadHistoricalPrices(id, days) {
  let coinGeckoError = "";
  try {
    const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}&precision=full`;
    const chart = await fetchJson(url, 12_000);
    const points = (chart.prices || []).filter((point) => Array.isArray(point) && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1])) && Number(point[1]) > 0)
      .map(([time, price]) => ({ time: Number(time), price: Number(price) }));
    if (points.length > 1) return { data: points, source: "coingecko" };
    coinGeckoError = "CoinGecko returned too little history.";
  } catch (error) {
    coinGeckoError = `CoinGecko history unavailable (${error.message || "request failed"}).`;
  }
  try {
    return await getBinanceHistory(id, days);
  } catch (error) {
    throw new Error(`${coinGeckoError} Binance history unavailable (${error.message || "request failed"}).`);
  }
}

export function getHistoricalPrices(id, days, { force = false } = {}) {
  const key = `${id}:${days}`;
  const cached = historyCache.get(key);
  if (!force && cached && Date.now() - cached.savedAt < CACHE_MS) return Promise.resolve(cached.result);
  if (historyInFlight.has(key)) return historyInFlight.get(key);
  const request = loadHistoricalPrices(id, days)
    .then((result) => { historyCache.set(key, { result, savedAt: Date.now() }); return result; })
    .finally(() => historyInFlight.delete(key));
  historyInFlight.set(key, request);
  return request;
}
