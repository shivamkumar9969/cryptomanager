// src/app/reports/page.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import PortfolioSidebar from "../portfolio/PortfolioSidebar";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

interface Balance {
  asset: string;
  value: number;
  exchange: string;
}

interface ExchangeData {
  name: string;
  balances: Balance[];
}

type PortfolioBalance = {
  asset: string;
  value: number;
  exchange: string;
};


export default function ReportsPage() {
  const [exchanges] = useState<string[]>(["Binance", "CoinDCX"]);
  const [data, setData] = useState<ExchangeData[]>([]);
  const [activeExchange, setActiveExchange] = useState("All");
  const [loading, setLoading] = useState(true);

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

          const mapped: PortfolioBalance[] = (Array.isArray(portfolio) ? portfolio : []).map(
            (b): PortfolioBalance => ({
              asset: String(b.asset),
              value: Number(b.value ?? 0),
              exchange: ex,
            })
          );

          return { name: ex, balances: mapped };
        })
        .catch(() => ({ name: ex, balances: [] as PortfolioBalance[] }));
    })
  )
    .then((results) => setData(results))
    .finally(() => setLoading(false));
}, [exchanges]);

  // Filter by exchange
  const getDisplayedBalances = () => {
    let balances: Balance[] = [];
    if (activeExchange === "All") {
      data.forEach((ex) => (balances = [...balances, ...ex.balances]));
    } else {
      const selected = data.find((ex) => ex.name === activeExchange);
      if (selected) balances = selected.balances;
    }

    // Combine assets < 1 into "Others"
    const grouped: Record<string, number> = {};
    let othersTotal = 0;

    balances.forEach((b) => {
      if (b.value < 1) {
        othersTotal += b.value;
      } else {
        grouped[b.asset] = (grouped[b.asset] || 0) + b.value;
      }
    });

    if (othersTotal > 0) {
      grouped["Others"] = (grouped["Others"] || 0) + othersTotal;
    }

    return grouped;
  };

  const balancesMap = getDisplayedBalances();
  const pieData = {
    labels: Object.keys(balancesMap),
    datasets: [
      {
        data: Object.values(balancesMap),
        backgroundColor: [
          "#facc15", "#60a5fa", "#34d399", "#f87171", "#a78bfa",
          "#f472b6", "#fb923c", "#22d3ee", "#c084fc", "#4ade80",
          "#e879f9", "#fbbf24", "#2dd4bf", "#f43f5e", "#3b82f6",
        ],
      },
    ],
  };

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [9000, 9500, 9400, 9800, 10200, 10800, 10500], // placeholder
        fill: false,
        borderColor: "#facc15",
        backgroundColor: "#facc15",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-[#121926] text-gray-200">
      {/* Sidebar */}
      <PortfolioSidebar
        exchanges={exchanges}
        active={activeExchange}
        onSelect={setActiveExchange}
      />

      {/* Main */}
      <div className="flex-1 p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>

        {loading ? (
          <div className="flex items-center justify-center mt-20 text-gray-400 text-lg">
            <div className="animate-spin h-9 w-9 border-4 border-yellow-500 border-t-transparent rounded-full mr-4"></div>
            Loading reports...
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Pie */}
            <div className="bg-gray-800 rounded-lg p-5 shadow flex-1 flex flex-col items-center min-h-[260px]">
              <h2 className="text-lg font-semibold mb-4 text-yellow-400">
                Portfolio Distribution
              </h2>
              {Object.keys(balancesMap).length === 0 ? (
                <p className="text-gray-400 text-center italic">No data available.</p>
              ) : (
                <Pie
                  data={pieData}
                  options={{
                    plugins: {
                      legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                          boxWidth: 14,
                          font: { size: 11 },
                          color: "#d1d5db",
                        },
                      },
                    },
                  }}
                />
              )}
            </div>

            {/* Line */}
            <div className="bg-gray-800 rounded-lg p-5 shadow flex-1 flex flex-col items-center min-h-[260px]">
              <h2 className="text-lg font-semibold mb-4 text-yellow-400">
                Portfolio Value Over Time
              </h2>
              <Line
                data={lineData}
                options={{
                  plugins: {
                    legend: {
                      labels: { color: "#d1d5db" },
                    },
                  },
                  scales: {
                    x: { ticks: { color: "#9ca3af" } },
                    y: { ticks: { color: "#9ca3af" } },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
