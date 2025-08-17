// src/app/portfolio/page.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import PortfolioSidebar from "./PortfolioSidebar";

interface Balance {
  asset: string;
  free: string;
  locked: string;
  exchange?: string;
}

interface ExchangeData {
  name: string;
  balances: Balance[];
}

export default function PortfolioPage() {
  const [exchanges, setExchanges] = useState<string[]>(["Binance", "CoinDCX"]);
  const [data, setData] = useState<ExchangeData[]>([]);
  const [activeExchange, setActiveExchange] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const results: ExchangeData[] = [];

        for (let ex of exchanges) {
          const endpoint =
            ex === "Binance" ? "/api/portfolio/binance" : "/api/portfolio/coindcx";

          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          let balancesArray = Array.isArray(res.data) ? res.data : res.data?.balances || [];

          const filtered = balancesArray
            .map((b: any) => ({
              asset: b.currency || b.asset,
              free: (b.balance ?? b.free ?? 0).toString(),
              locked: (b.locked_balance ?? b.locked ?? 0).toString(),
              exchange: ex,
            }))
            .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);

          results.push({ name: ex, balances: filtered });
        }

        setData(results);
      } catch (err) {
        console.error("Portfolio fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [exchanges]);

  const getDisplayedBalances = () => {
    let allBalances: Balance[] = [];

    if (activeExchange === "All") {
      data.forEach((ex) => (allBalances = [...allBalances, ...ex.balances]));
    } else {
      const selected = data.find((ex) => ex.name === activeExchange);
      if (selected) allBalances = selected.balances;
    }

    return allBalances.filter((b) => b.asset.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const displayed = getDisplayedBalances();

  // Helper: define badge color and label per exchange
  const getExchangeBadge = (exchange?: string) => {
    if (exchange === "Binance")
      return (
        <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded bg-opacity-80 bg-yellow-500 text-black select-none">
          Binance
        </span>
      );
    if (exchange === "CoinDCX")
      return (
        <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded bg-opacity-80 bg-blue-500 text-white select-none">
          CoinDCX
        </span>
      );
    return null;
  };

  // Coin icon loader – uses static assets from public/coins/
  const CoinIcon = ({ asset }: { asset: string }) => {
    const symbol = asset.toLowerCase();
    const [imgSrc, setImgSrc] = useState(`/coins/${symbol}.png`);

    const handleError = () => {
      setImgSrc("/coins/default.png");
    };

    return (
      <img
        src={imgSrc}
        alt={asset}
        className="w-9 h-9 rounded-full bg-gray-900 border border-gray-700 object-cover"
        onError={handleError}
      />
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <PortfolioSidebar exchanges={exchanges} active={activeExchange} onSelect={setActiveExchange} />

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Removed Portfolio heading */}

        {/* Smaller Search Box */}
        <input
          type="text"
          placeholder="Search assets..."
          className="w-72 p-2 mb-6 rounded-md border border-gray-700 bg-gray-800 text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center mt-20 text-gray-400 text-lg">
            <div className="animate-spin h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full mr-3"></div>
            Loading coins...
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-gray-400 text-center mt-20">No balances found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((b, idx) => (
              <div
                key={idx}
                className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-800 shadow-md px-4 py-4 flex flex-col gap-3
          hover:bg-gradient-to-br hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 hover:shadow-lg transition"
              >
                {/* Exchange badge */}
                {activeExchange === "All" ? getExchangeBadge(b.exchange) : getExchangeBadge(activeExchange)}

                {/* Coin logo & symbol */}
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-700 bg-gray-900 overflow-hidden">
                    <CoinIcon asset={b.asset} />
                  </div>
                  <div className="text-base font-semibold tracking-wide text-yellow-300">{b.asset}</div>
                </div>

                {/* Balances */}
                <div className="flex flex-row gap-4 ml-1">
                  <span className="text-xs text-green-400 font-medium">
                    Free: <span className="font-semibold">{parseFloat(b.free).toLocaleString(undefined, { maximumFractionDigits: 8 })}</span>
                  </span>
                  <span className={`text-xs font-medium ${parseFloat(b.locked) > 0 ? "text-red-400" : "text-gray-500"}`}>
                    Locked: <span>{parseFloat(b.locked).toLocaleString(undefined, { maximumFractionDigits: 8 })}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
