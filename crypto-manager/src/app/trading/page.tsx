"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

// ✅ Declare TradingView on window safely
declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

const EXCHANGES = ["Binance", "CoinDCX"];
const COIN_TABS = ["ALL", "INR", "BTC", "MORE"];

// ✅ Coin interface with safe type for unknown fields
interface Coin {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  bidPrice: number;
  askPrice: number;
  volume: number;
  quoteVolume: number;
  [key: string]: unknown;
}

export default function TradingPage() {
  const [exchange, setExchange] = useState("Binance");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [loading, setLoading] = useState(false);

  const [tradeType, setTradeType] = useState("buy");
  const [orderType, setOrderType] = useState("limit");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");

  const chartContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Initial load
  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trading/prices`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { exchange },
          }
        );
        if (!mounted) return;
        setCoins(res.data.slice(0, 100));
        if (res.data.length) setSelectedCoin(res.data[0]);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchInitial();
    return () => {
      mounted = false;
    };
  }, [exchange]);

  // ✅ Poll for price changes
  useEffect(() => {
    let mounted = true;
    const pollPrices = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trading/prices`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { exchange },
          }
        );
        if (!mounted) return;
        setCoins((prevCoins) =>
          prevCoins.map((coin) => {
            const updated = res.data.find((c: Coin) => c.symbol === coin.symbol);
            return updated ? { ...coin, ...updated } : coin;
          })
        );
      } catch (err) {
        console.error(err);
      }
    };
    const interval = setInterval(pollPrices, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [exchange]);

  const filteredCoins = coins
    .filter((c) => {
      if (activeTab === "ALL") return true;
      if (activeTab === "INR") return c.symbol.endsWith("INR");
      if (activeTab === "BTC") return c.symbol.endsWith("BTC");
      return true;
    })
    .filter((c) => c.symbol.toLowerCase().includes(search.toLowerCase()));

  // ✅ Reset selected coin if filter changes
  useEffect(() => {
    if (
      filteredCoins.length &&
      (!selectedCoin ||
        !filteredCoins.find((c) => c.symbol === selectedCoin.symbol))
    ) {
      setSelectedCoin(filteredCoins[0]);
    }
  }, [activeTab, search, coins]);

  // ✅ TradingView widget initialization (safe + auto reload)
  useEffect(() => {
    if (!selectedCoin || !chartContainerRef.current) return;

    chartContainerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      if (!window.TradingView) return;
      new window.TradingView!.widget({
        symbol: `${exchange === "Binance" ? "BINANCE:" : ""}${selectedCoin.symbol.replace("/", "")}`,
        interval: "60",
        theme: "dark",
        container_id: "tv_chart_container",
        width: "100%",
        height: 450,
        autosize: true,
      });
    };


    chartContainerRef.current.appendChild(script);
  }, [selectedCoin, exchange]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuantity(e.target.value);
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAmount(e.target.value);
  const handleOrderType = (type: string) => setOrderType(type);

  return (
    <div className="min-h-screen h-screen bg-[#0d0d12] text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] flex flex-col bg-[#191921] p-4 h-screen">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg font-bold">
            {selectedCoin ? selectedCoin.symbol : "Bitcoin"}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {COIN_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-xs ${activeTab === tab ? "bg-indigo-700" : "bg-[#222228]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          className="bg-transparent border-b border-gray-600 px-2 py-1 my-2 mb-4 text-sm"
          value={search}
          placeholder="Search Coins"
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Coin list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {loading ? (
            <div className="flex items-center justify-center py-8 mb-8">
              <Loader2 className="animate-spin text-indigo-400 w-6 h-6" />
            </div>
          ) : (
            filteredCoins.map((coin) => (
              <div
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin)}
                className={`flex items-center justify-between py-2 px-1 cursor-pointer rounded transition ${selectedCoin && selectedCoin.symbol === coin.symbol
                    ? "bg-indigo-700/60"
                    : "hover:bg-[#232330]"
                  }`}
              >
                <span className="text-sm">{coin.symbol}</span>
                <span className="ml-auto text-xs">
                  <span
                    className={`px-2 py-1 rounded text-white font-semibold ${coin.priceChangePercent >= 0
                        ? "bg-green-600"
                        : "bg-red-600"
                      }`}
                  >
                    {coin.lastPrice.toFixed(2)}
                  </span>
                  <span
                    className={`ml-1 ${coin.priceChangePercent >= 0
                        ? "text-green-400"
                        : "text-red-400"
                      }`}
                  >
                    {coin.priceChangePercent.toFixed(2)}%
                  </span>
                </span>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col bg-[#14141a] h-full overflow-hidden">
        <section className="p-6 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-semibold">
              {selectedCoin ? selectedCoin.symbol : "Select a Market"}
            </h2>
            <span className="text-gray-400">
              {selectedCoin
                ? `${exchange} candlestick chart`
                : "Live Price Chart"}
            </span>
          </div>
          <select
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-4 py-2"
          >
            {EXCHANGES.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </section>

        {/* Chart + Trading Panel */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col items-center py-4 px-6 overflow-hidden">
            <div
              ref={chartContainerRef}
              id="tv_chart_container"
              className="w-full h-[450px] min-h-[320px]"
            />

            {/* Trading panel */}
            {selectedCoin && (
              <div className="w-full mt-8 bg-[#1a1a22] p-6 rounded-lg flex flex-col gap-4">
                {/* Buy/Sell tabs */}
                <div className="flex gap-8">
                  <div>
                    <button
                      className={`text-lg font-semibold pb-1 mr-4 ${tradeType === "buy"
                          ? "text-green-500 border-b-2 border-green-500"
                          : "text-gray-400"
                        }`}
                      onClick={() => setTradeType("buy")}
                      type="button"
                    >
                      Buy {selectedCoin.symbol}
                    </button>
                    <button
                      className={`text-lg font-semibold pb-1 ${tradeType === "sell"
                          ? "text-red-500 border-b-2 border-red-500"
                          : "text-gray-400"
                        }`}
                      onClick={() => setTradeType("sell")}
                      type="button"
                    >
                      Sell {selectedCoin.symbol}
                    </button>
                  </div>

                  {/* Order type */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="orderType"
                        checked={orderType === "limit"}
                        onChange={() => handleOrderType("limit")}
                        className="accent-green-500"
                      />
                      Limit
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="orderType"
                        checked={orderType === "market"}
                        onChange={() => handleOrderType("market")}
                        className="accent-green-500"
                      />
                      Market
                    </label>
                    <div className="ml-4 text-xs text-gray-400 font-semibold">
                      Bal: 0.003 USDT
                    </div>
                  </div>
                </div>

                {/* Inputs */}
                <div className="flex gap-6 items-center">
                  <div>
                    <label className="block mb-1 text-xs text-gray-500">
                      Price (USDT)*
                    </label>
                    <input
                      className="bg-[#111116] text-white px-4 py-2 rounded w-32"
                      value={selectedCoin.lastPrice.toFixed(2)}
                      readOnly={orderType === "market"}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs text-gray-500">
                      Quantity (
                      {selectedCoin.symbol.replace(/USDT|INR|BTC/g, "")})*
                    </label>
                    <input
                      className="bg-[#111116] text-white px-4 py-2 rounded w-32"
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs text-gray-500">
                      {tradeType === "buy"
                        ? "Buy for (USDT)"
                        : "Sell for (USDT)"}
                    </label>
                    <input
                      className="bg-[#111116] text-white px-4 py-2 rounded w-40"
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="Amount..."
                      min="0"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    className="px-6 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
                    type="button"
                  >
                    CANCEL
                  </button>
                  <button
                    className={`px-6 py-2 rounded font-bold ${tradeType === "buy"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                    type="button"
                  >
                    {tradeType === "buy"
                      ? `BUY ${selectedCoin.symbol}`
                      : `SELL ${selectedCoin.symbol}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Book */}
          <aside className="w-[340px] flex flex-col border-l border-gray-900 bg-[#191921] min-h-full">
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-lg mb-2">Order Book</h4>
              {selectedCoin && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-green-400 text-xs mb-1">Bids</div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs">
                        {selectedCoin.bidPrice.toFixed(2)}
                      </span>
                      <span className="text-green-400 text-xs">
                        {selectedCoin.volume.toFixed(3)}
                      </span>
                      <span className="text-xs">
                        {selectedCoin.quoteVolume?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-red-400 text-xs mb-1">Asks</div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs">
                        {selectedCoin.askPrice.toFixed(2)}
                      </span>
                      <span className="text-red-400 text-xs">
                        {selectedCoin.volume.toFixed(3)}
                      </span>
                      <span className="text-xs">
                        {selectedCoin.quoteVolume?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
