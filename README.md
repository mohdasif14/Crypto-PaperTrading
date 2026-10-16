# CoinPilot — Crypto Paper Trading Dashboard

CoinPilot is a React + Vite learning project for exploring cryptocurrency markets and practising trades with virtual money. It does not buy or sell real crypto.

## Run it in VS Code

1. Install Node.js LTS from https://nodejs.org/ if it is not already installed.
2. Extract this folder and open **this folder** in VS Code.
3. Open Terminal → New Terminal.
4. Run:

   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```

5. Open the local URL printed in the terminal.

If you use Command Prompt instead of PowerShell, `npm install` and `npm run dev` also work.

## Market data and charts

- Market list first requests live market information from CoinGecko.
- If CoinGecko is unavailable or rate limited, it tries Binance's public spot market-data endpoints for supported USDT pairs.
- The app does not contain hardcoded price data for the market table and does not substitute static prices when both live providers fail. Instead, it shows a clear **NO LIVE DATA** state and a retry button.
- A successful provider response refreshes automatically every 30 seconds; click **Refresh prices** for a manual request.
- Historical coin charts request timestamped CoinGecko history first, then try Binance public candles. If neither returns history, the chart shows an error instead of inventing historical prices.
- Binance fallback provides live prices and 24-hour ticker stats, but does not provide market capitalization, rank, or circulating supply. Those fields show `—` when unavailable.
- Public API availability varies. This app cannot guarantee a new price tick every refresh, and an API error must not be treated as a successful update.

## Features

- Markets with search and sorting
- Coin details and historical chart ranges (24H, 7D, 30D, 90D)
- Watchlist
- Virtual buy/sell modal with insufficient-cash and insufficient-holdings validation
- Portfolio and transaction history
- LocalStorage persistence for the simulated account
- Responsive dark UI and one primary navigation system

## Source structure

```text
src/
├── components/     # App layout, market table, chart, trade modal, stat card
├── context/        # Shared virtual account state and trades
├── data/           # Live API requests and historical chart data
├── pages/          # Markets, coin details, portfolio, watchlist, history
├── App.jsx         # Routes and market refresh lifecycle
├── main.jsx        # React entry point
└── styles.css      # Global styles and responsive layout
```

## Before sharing

Run `npm.cmd run build` to confirm a production build. Market prices and charts require an internet connection to the public providers. The project uses only React, JavaScript, CSS, Vite, React Router, Recharts, and Lucide React.
