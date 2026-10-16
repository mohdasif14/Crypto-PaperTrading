export const demoCoins = [
{id:"bitcoin",name:"Bitcoin",symbol:"btc",image:"https://assets.coingecko.com/coins/images/1/large/bitcoin.png",current_price:67420.12,market_cap:1330000000000,market_cap_rank:1,total_volume:28000000000,price_change_percentage_24h:2.45,high_24h:68100,low_24h:65300,circulating_supply:19700000},
{id:"ethereum",name:"Ethereum",symbol:"eth",image:"https://assets.coingecko.com/coins/images/279/large/ethereum.png",current_price:3520.45,market_cap:422000000000,market_cap_rank:2,total_volume:14000000000,price_change_percentage_24h:1.82,high_24h:3580,low_24h:3440,circulating_supply:120000000},
{id:"tether",name:"Tether",symbol:"usdt",image:"https://assets.coingecko.com/coins/images/325/large/Tether.png",current_price:1,market_cap:112000000000,market_cap_rank:3,total_volume:45000000000,price_change_percentage_24h:0.02,high_24h:1.01,low_24h:.99,circulating_supply:112000000000},
{id:"binancecoin",name:"BNB",symbol:"bnb",image:"https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",current_price:598.14,market_cap:88000000000,market_cap_rank:4,total_volume:1200000000,price_change_percentage_24h:-.85,high_24h:610,low_24h:590,circulating_supply:147000000},
{id:"solana",name:"Solana",symbol:"sol",image:"https://assets.coingecko.com/coins/images/4128/large/solana.png",current_price:164.28,market_cap:76000000000,market_cap_rank:5,total_volume:2300000000,price_change_percentage_24h:4.67,high_24h:168,low_24h:156,circulating_supply:462000000},
{id:"ripple",name:"XRP",symbol:"xrp",image:"https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",current_price:.58,market_cap:32000000000,market_cap_rank:7,total_volume:950000000,price_change_percentage_24h:-1.24,high_24h:.61,low_24h:.57,circulating_supply:55000000000},
{id:"dogecoin",name:"Dogecoin",symbol:"doge",image:"https://assets.coingecko.com/coins/images/5/large/dogecoin.png",current_price:.16,market_cap:23000000000,market_cap_rank:8,total_volume:650000000,price_change_percentage_24h:3.14,high_24h:.17,low_24h:.15,circulating_supply:144000000000},
{id:"avalanche-2",name:"Avalanche",symbol:"avax",image:"https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",current_price:36.52,market_cap:14000000000,market_cap_rank:11,total_volume:340000000,price_change_percentage_24h:2.02,high_24h:37.4,low_24h:35.1,circulating_supply:395000000}
];
export const fmt = (v, compact=false) => Number.isFinite(Number(v)) ? new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",notation:compact?"compact":"standard",maximumFractionDigits:Number(v)<1?5:2}).format(Number(v)) : "—";
export const num = (v) => Number.isFinite(Number(v)) ? new Intl.NumberFormat("en-US",{maximumFractionDigits:8}).format(Number(v)) : "—";
export const pct = (v) => `${Number(v)>0?"+":""}${Number(v||0).toFixed(2)}%`;
export async function getMarkets(){
 try {
  const r=await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h",{headers:{accept:"application/json"},signal:AbortSignal.timeout(9000)});
  if(!r.ok) throw new Error("Market API returned "+r.status);
  const data=await r.json(); if(!Array.isArray(data)||!data.length) throw new Error("No market data");
  return {coins:data,source:"live"};
 } catch(e) { return {coins:demoCoins,source:"demo",error:e.message}; }
}
