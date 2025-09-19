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
  const [hideSmallBalances, setHideSmallBalances] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: keyof Balance; direction: 'asc' | 'desc' } | null>(null);

  const currencySymbolMap: Record<string, string> = {
    USD: "$ ",
    USDT: "$ ",
    INR: "₹ ",
    EUR: "€ ",
    BTC: "₿ ",
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
            const portfolio = ex === "Binance" ? res.data.binance : res.data.coindcx;
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
    let filtered = allBalances.filter((b) =>
      b.asset?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (hideSmallBalances) {
      filtered = filtered.filter((b) => b.value >= 1);
    }
    return filtered;
  };

  const displayed = getDisplayedBalances();

  const onSort = (columnKey: keyof Balance) => {
    if (sortConfig?.key === columnKey) {
      setSortConfig({
        key: columnKey,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key: columnKey, direction: "asc" });
    }
  };

  const renderSortArrows = (columnKey: keyof Balance) => (
    <span className="ml-1 flex flex-col text-xs text-gray-400 leading-none">
      <span
        className={
          sortConfig?.key === columnKey && sortConfig?.direction === "asc"
            ? "text-yellow-400"
            : ""
        }
      >
        ▲
      </span>
      <span
        className={
          sortConfig?.key === columnKey && sortConfig?.direction === "desc"
            ? "text-yellow-400"
            : ""
        }
      >
        ▼
      </span>
    </span>
  );

  const sortedDisplayed = sortConfig
    ? [...displayed].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (valA === undefined) valA = sortConfig.key === "asset" ? "" : 0;
      if (valB === undefined) valB = sortConfig.key === "asset" ? "" : 0;
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    })
    : displayed;

  const estTotalValue = sortedDisplayed.reduce((acc, b) => acc + b.value, 0);

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
    <div className="flex min-h-screen bg-[#121926] text-gray-200 font-sans">
      <PortfolioSidebar
        exchanges={exchanges}
        active={activeExchange}
        onSelect={setActiveExchange}
      />

      <div className="flex-1 p-6 max-w-7xl mx-auto">
        <input
          type="text"
          placeholder="Search assets..."
          className="w-80 p-3 mb-4 rounded-lg border border-gray-700 bg-[#1e293b] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="mb-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="hideSmallBalances"
              checked={hideSmallBalances}
              onChange={(e) => setHideSmallBalances(e.target.checked)}
              className="accent-blue-500 scale-125"
            />
            <label htmlFor="hideSmallBalances" className="text-gray-400 select-none text-sm font-medium">
              Hide small balances (value &lt; 1)
            </label>
          </div>

          <div className="inline-block text-lg font-semibold text-gray-300 bg-[#1e293b] rounded-md px-6 py-3 shadow-lg select-none">
            <span className="text-gray-400 mr-2">Est. Total Value:</span>
            <span className="text-blue-400 font-extrabold">{formatTotalValue(estTotalValue)}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center mt-20 text-gray-400 text-lg">
            <div className="animate-spin h-9 w-9 border-4 border-blue-500 border-t-transparent rounded-full mr-4"></div>
            Loading portfolio...
          </div>
        ) : sortedDisplayed.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-lg">No balances found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-xl border border-gray-700">
            <table className="w-full table-auto rounded-lg border border-gray-700">
              <thead>
                <tr className="border-b border-gray-700">
                  <th
                    className="px-5 py-4 cursor-pointer select-none text-gray-300 uppercase tracking-wider text-left text-sm font-semibold"
                    onClick={() => onSort("asset")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Asset</span>
                      {renderSortArrows("asset")}
                    </div>
                  </th>

                  <th
                    className="px-5 py-4 cursor-pointer select-none text-green-400 uppercase tracking-wider text-left text-sm font-semibold"
                    onClick={() => onSort("free_quantity")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Free Quantity</span>
                      {renderSortArrows("free_quantity")}
                    </div>
                  </th>

                  <th
                    className="px-5 py-4 cursor-pointer select-none text-red-400 uppercase tracking-wider text-left text-sm font-semibold"
                    onClick={() => onSort("locked_quantity")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Locked Quantity</span>
                      {renderSortArrows("locked_quantity")}
                    </div>
                  </th>

                  <th
                    className="px-5 py-4 cursor-pointer select-none bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider text-left text-sm font-semibold"
                    onClick={() => onSort("price")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Market Price</span>
                      {renderSortArrows("price")}
                    </div>
                  </th>

                  <th
                    className="px-5 py-4 cursor-pointer select-none text-cyan-400 uppercase tracking-wider text-left text-sm font-semibold"
                    onClick={() => onSort("value")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Current Value</span>
                      {renderSortArrows("value")}
                    </div>
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wide">
                    Exchange
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedDisplayed.map((b, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-700 hover:bg-[#2a3a4c] transition cursor-default"
                  >
                    <td className="px-5 py-3 flex items-center space-x-3">
                      <CoinIcon asset={b.asset} />
                      <span className="font-semibold text-gray-100">{b.asset}</span>
                    </td>

                    <td className="px-5 py-3">
                      <span className="text-green-400 font-semibold">
                        {b.free_quantity.toLocaleString(undefined, {
                          maximumFractionDigits: 8,
                        })}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={
                          b.locked_quantity > 0
                            ? "text-red-400 font-bold"
                            : "text-gray-500 font-semibold"
                        }
                      >
                        {b.locked_quantity.toLocaleString(undefined, {
                          maximumFractionDigits: 8,
                        })}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-left font-semibold text-teal-300 hover:text-cyan-400 transition">
                      {formatCurrency(b.price)}
                    </td>

                    <td className="px-5 py-3">
                      <span className="font-extrabold text-cyan-400">
                        {formatCurrency(b.value)}
                      </span>
                    </td>

                    <td className="px-5 py-3">{getExchangeBadge(b.exchange)}</td>
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
