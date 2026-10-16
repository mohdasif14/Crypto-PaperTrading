# TradingApp src folder

This is the componentized `src` folder for the CoinPilot crypto paper-trading dashboard.

## Installation
1. Copy the contents of this `src` folder into your existing React + Vite project's `src` folder, replacing the old `App.jsx`, `main.jsx`, and `styles.css` when prompted.
2. Ensure your project's `package.json` includes these dependencies: `react`, `react-dom`, `react-router-dom`, `lucide-react`, and `recharts`.
3. From the project root, run `npm install` and `npm run dev`.

If the dependencies are missing, run:
`npm install react-router-dom lucide-react recharts`

## Structure
- `components/`: reusable UI components
- `context/`: shared virtual account state and trade logic
- `data/`: market data helpers and demo fallback data
- `pages/`: Market, Coin Details, Watchlist, Portfolio, and History pages
- `App.jsx`: route setup and market-data loading
- `main.jsx`: React entry point and global stylesheet import
- `styles.css`: dashboard styling

Trades are simulated and stored in browser LocalStorage. They do not interact with a real exchange.
