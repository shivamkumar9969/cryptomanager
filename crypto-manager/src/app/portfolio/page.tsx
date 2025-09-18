// src/app/portfolio/page.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import PortfolioSidebar from "./PortfolioSidebar";

interface Balance {
  asset: string;
  free_quantity: number;
  locked_quantity: number;
  price: number;
  value: number;
  exchange?: string;
}

interface ApiBalance {
  asset: string;
  free_quantity?: string | number;
  free?: string | number;
  quantity?: string | number;
  locked_quantity?: string | number;
  locked?: string | number;
  price?: string | number;
  value?: string | number;
}


interface ExchangeData {
  name: string;
  balances: Balance[];
}

export default function PortfolioPage() {
  const [exchanges] = useState<string[]>(["Binance", "CoinDCX"]);
  const [data, setData] = useState<ExchangeData[]>([]);
  const [activeExchange, setActiveExchange] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const currencySymbolMap: Record<string, string> = {
    USD: "$",
    USDT: "$",
    INR: "₹",
    EUR: "€",
    BTC: "₿",
  };

  const currencyCode =
    typeof window !== "undefined" && localStorage.getItem("currency")
      ? localStorage.getItem("currency")!.toUpperCase()
      : "USD";

  const currencySymbol = currencySymbolMap[currencyCode] || currencyCode;

  const numberFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 8,
  });

  const formatCurrency = (amount: number) =>
    amount !== 0 ? `${currencySymbol}${numberFormatter.format(amount)}` : "-";

  // New formatter for total value - 2 decimals only
  const formatTotalValue = (amount: number) =>
    amount !== 0 ? `${currencySymbol}${amount.toFixed(2)}` : "-";

  const mapApiBalances = (arr: ApiBalance[], exchange: string): Balance[] =>
    arr.map((b) => ({
      asset: b.asset,
      free_quantity: Number(b.free_quantity ?? b.free ?? b.quantity ?? 0),
      locked_quantity: Number(b.locked_quantity ?? b.locked ?? 0),
      price: Number(b.price ?? 0),
      value: Number(b.value ?? 0),
      exchange,
    }));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const selectedCurrency = localStorage.getItem("currency") || "USDT";
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    Promise.all(
      exchanges.map((ex) => {
        const endpoint =
          ex === "Binance" ? "/api/portfolio/binance" : "/api/portfolio/coindcx";
        return axios
          .get(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { currency: selectedCurrency },
          })
          .then((res) => {
            const portfolio =
              ex === "Binance" ? res.data.binance : res.data.coindcx;
            return {
              name: ex,
              balances: Array.isArray(portfolio)
                ? mapApiBalances(portfolio, ex)
                : [],
            };
          })
          .catch(() => ({
            name: ex,
            balances: [],
          }));
      })
    )
      .then((results) => setData(results))
      .finally(() => setLoading(false));
  }, [exchanges]);

  const getDisplayedBalances = () => {
    let allBalances: Balance[] = [];
    if (activeExchange === "All") {
      data.forEach((ex) => (allBalances = [...allBalances, ...ex.balances]));
    } else {
      const selected = data.find((ex) => ex.name === activeExchange);
      if (selected) allBalances = selected.balances;
    }
    return allBalances.filter((b) =>
      b.asset?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const displayed = getDisplayedBalances();

  // Calculate estimated total value with 2 decimals format
  const estTotalValue = displayed.reduce((acc, b) => acc + b.value, 0);

  const CoinIcon = ({ asset }: { asset: string }) => {
    const symbol = asset?.toLowerCase();
    const [imgSrc, setImgSrc] = useState(`/coins/${symbol}.png`);
    return (
      <img
        src={imgSrc}
        alt={asset}
        className="w-7 h-7 rounded-full bg-gray-900 border border-gray-700 object-cover mr-2"
        onError={() => setImgSrc("/coins/default.png")}
      />
    );
  };

  const getExchangeBadge = (exchange?: string) => {
    if (exchange === "Binance")
      return (
        <span className="px-2 py-0.5 text-xs rounded bg-yellow-500 text-black font-semibold">
          Binance
        </span>
      );
    if (exchange === "CoinDCX")
      return (
        <span className="px-2 py-0.5 text-xs rounded bg-blue-500 text-white font-semibold">
          CoinDCX
        </span>
      );
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <PortfolioSidebar
        exchanges={exchanges}
        active={activeExchange}
        onSelect={setActiveExchange}
      />

      <div className="flex-1 p-4">
        <input
          type="text"
          placeholder="Search assets..."
          className="w-72 p-2 mb-2 rounded-md border border-gray-700 bg-gray-800 text-white placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Estimated Total Value display */}
        {/* Estimated Total Value display */}
        <div className="mb-4 flex justify-end">
          <div className="inline-block text-lg font-bold text-gray-300 bg-[#181f2a] rounded-lg px-5 py-2 shadow-md select-none">
            <span className="text-gray-400">Est. Total Value:</span>{" "}
            <span className="text-green-400 font-extrabold">
              {formatTotalValue(estTotalValue)}
            </span>
          </div>
        </div>




        {loading ? (
          <div className="flex items-center justify-center mt-4 text-gray-400 text-lg">
            <div className="animate-spin h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full mr-3"></div>
            Loading coins...
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-gray-400 text-center mt-4">No balances found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 rounded-xl border border-gray-800 shadow-md">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-300 uppercase">
                    Asset
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-green-300 uppercase">
                    Free
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-red-300 uppercase">
                    Locked
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-300 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase">
                    Total Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-300 uppercase">
                    Exchange
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((b, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-2 flex items-center">
                      <CoinIcon asset={b.asset} />
                      <span className="font-semibold text-yellow-200">{b.asset}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-green-300 font-semibold">
                        {b.free_quantity.toLocaleString(undefined, {
                          maximumFractionDigits: 8,
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          b.locked_quantity > 0
                            ? "text-red-300 font-bold"
                            : "text-gray-500 font-semibold"
                        }
                      >
                        {b.locked_quantity.toLocaleString(undefined, {
                          maximumFractionDigits: 8,
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-yellow-400 font-medium">
                        {formatCurrency(b.price)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-extrabold text-cyan-400">
                        {formatCurrency(b.value)}
                      </span>
                    </td>


                    <td className="px-4 py-2">{getExchangeBadge(b.exchange)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
