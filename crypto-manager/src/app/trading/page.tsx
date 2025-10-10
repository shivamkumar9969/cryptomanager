"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";

const EXCHANGES = ["Binance", "CoinDCX"];

interface Coin {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  bidPrice: number;
  askPrice: number;
}

export default function TradingPage() {
  const [exchange, setExchange] = useState("Binance");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPrices = async () => {
    const token = localStorage.getItem("token");
    if (!token) return console.error("No token found in localStorage");

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/trading/prices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { exchange },
      });

      // Merge new prices into existing coins
      setCoins((prevCoins) => {
        const updatedCoins = res.data.slice(0, 100).map((newCoin: Coin) => {
          const existing = prevCoins.find((c) => c.symbol === newCoin.symbol);
          return existing ? { ...existing, ...newCoin } : newCoin;
        });
        return updatedCoins;
      });
    } catch (err) {
      console.error("API fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, [exchange]);

  const filteredCoins = coins.filter((c) =>
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Crypto Market Dashboard</h1>

          <div className="flex items-center gap-3">
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {EXCHANGES.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search coin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-indigo-400 w-8 h-8" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-800 text-gray-300 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Last Price</th>
                  <th className="px-4 py-3">Change</th>
                  <th className="px-4 py-3">High</th>
                  <th className="px-4 py-3">Low</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">Bid</th>
                  <th className="px-4 py-3">Ask</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoins.map((coin) => {
                  const isUp = coin.priceChange >= 0;
                  return (
                    <tr
                      key={coin.symbol}
                      className="border-t border-gray-700 hover:bg-gray-800/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-indigo-400">{coin.symbol}</td>
                      <td className="px-4 py-3">${coin.lastPrice.toFixed(4)}</td>
                      <td
                        className={`px-4 py-3 flex items-center gap-1 ${isUp ? "text-green-400" : "text-red-400"
                          }`}
                      >
                        {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {coin.priceChangePercent.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3">${coin.highPrice.toFixed(4)}</td>
                      <td className="px-4 py-3">${coin.lowPrice.toFixed(4)}</td>
                      <td className="px-4 py-3">{coin.volume.toFixed(2)}</td>
                      <td className="px-4 py-3">${coin.bidPrice.toFixed(4)}</td>
                      <td className="px-4 py-3">${coin.askPrice.toFixed(4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          Auto-refreshes every 15 seconds • Source: {exchange} API
        </p>
      </div>
    </div>
  );
}
