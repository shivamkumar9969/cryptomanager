// src/app/reports/page.tsx
"use client";
import { useState, useEffect } from "react";
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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

interface PortfolioItem {
  asset: string;
  value: number;
  exchange: string;
}

export default function ReportsPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [activeExchange, setActiveExchange] = useState("All");
  const exchangesList = ["All", "Binance", "CoinDCX"];

  useEffect(() => {
    // Replace this simulated data with your backend API call
    const simulatedPortfolio: PortfolioItem[] = [
      { asset: "BTC", value: 5000, exchange: "Binance" },
      { asset: "ETH", value: 3000, exchange: "Binance" },
      { asset: "USDT", value: 2000, exchange: "CoinDCX" },
    ];
    setPortfolio(simulatedPortfolio);
  }, []);

  const filteredPortfolio =
    activeExchange === "All"
      ? portfolio
      : portfolio.filter((item) => item.exchange === activeExchange);

  const pieData = {
    labels: filteredPortfolio.map((p) => p.asset),
    datasets: [
      {
        data: filteredPortfolio.map((p) => p.value),
        backgroundColor: ["#facc15", "#60a5fa", "#34d399", "#f87171"],
      },
    ],
  };

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Example days
    datasets: [
      {
        label: "Portfolio Value",
        data: [9000, 9500, 9400, 9800, 10200, 10800, 10500], // Replace with real data
        fill: false,
        borderColor: "#facc15",
        backgroundColor: "#facc15",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={activeExchange}
          onChange={(e) => setActiveExchange(e.target.value)}
          className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
        >
          {exchangesList.map((ex) => (
            <option key={ex} value={ex}>
              {ex}
            </option>
          ))}
        </select>
      </div>

      {/* Charts section, side-by-side and smaller */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="bg-gray-800 rounded-lg p-5 shadow flex-1 flex flex-col items-center min-h-[260px] max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-yellow-400">
            Portfolio Distribution
          </h2>
          {filteredPortfolio.length === 0 ? (
            <p className="text-gray-400 text-center italic">No portfolio data.</p>
          ) : (
            <Pie data={pieData} />
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-5 shadow flex-1 flex flex-col items-center min-h-[260px] max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-yellow-400">
            Portfolio Value Over Time
          </h2>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}
