// src/app/dashboard/page.tsx

"use client";
import { useState, useEffect } from "react";
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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

interface ExchangeStatus {
  name: string;
  connected: boolean;
  balancesValue?: number;
  lastSync?: string;
}
interface Asset {
  asset: string;
  quantity: number;
  value: number;
  platforms: string[];
}
interface Activity {
  exchange: string;
  type: string;
  asset: string;
  amount: number;
  date: string;
}

const SECTIONS = ["Balance", "Allocation", "Top Assets", "Recent Activity"] as const;
type Section = typeof SECTIONS[number];

export default function DashboardPage() {
  const [currentSection, setCurrentSection] = useState<Section>("Balance");
  const [exchanges, setExchanges] = useState<ExchangeStatus[]>([]);
  const [topAssets, setTopAssets] = useState<Asset[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeExchange, setActiveExchange] = useState("All");

  //const token = localStorage.getItem("token");
  const selectedCurrency = localStorage.getItem("currency") || "USDT";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { currency: selectedCurrency },
          }
        );

       console.log(res.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError((err.response?.data as { message?: string })?.message || "Failed to summary");
        } else {
          setError("summary failed");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen px-4 text-center">
        <h2 className="text-red-500 text-xl font-semibold mb-4">
          Error loading dashboard
        </h2>
        <p className="text-gray-400 max-w-md">{error}</p>
      </div>
    );
  }

  const exchangesList = ["All", ...exchanges.map((ex) => ex.name)];

  const filteredPortfolio =
    activeExchange === "All"
      ? topAssets
      : topAssets.filter((item) => item.platforms.includes(activeExchange));

  const pieData = {
    labels: filteredPortfolio.map((a) => a.asset),
    datasets: [
      {
        data: filteredPortfolio.map((a) => a.value),
        backgroundColor: [
          "#facc15",
          "#60a5fa",
          "#34d399",
          "#f87171",
          "#a78bfa",
          "#fbbf24",
          "#22d3ee",
        ],
      },
    ],
  };

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [9000, 9500, 9400, 9800, 10200, 10800, 10500],
        fill: false,
        borderColor: "#facc15",
        backgroundColor: "#facc15",
        tension: 0.1,
      },
    ],
  };

  const SidebarItem = ({ name }: { name: Section }) => (
    <button
      onClick={() => setCurrentSection(name)}
      className={`block w-full text-left px-6 py-3 rounded-md mb-2 transition ${currentSection === name
        ? "bg-yellow-500 text-black font-semibold"
        : "text-gray-300 hover:bg-yellow-600 hover:text-black"
        }`}
    >
      {name}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="w-60 bg-gray-800 p-6 flex flex-col">
        <h1 className="text-yellow-400 text-xl font-bold mb-8">Dashboard</h1>
        {SECTIONS.map((section) => (
          <SidebarItem key={section} name={section} />
        ))}
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {currentSection === "Balance" && (
          <section className="space-y-10">
            <div className="max-w-xl mx-auto bg-gray-800 rounded-xl p-10 text-center shadow-lg">
              <h2 className="text-3xl font-semibold text-yellow-400 mb-4">
                Total Portfolio Value
              </h2>
              <p className="text-6xl font-extrabold text-white tracking-tight">
                ₹{totalBalance.toLocaleString()}
              </p>
              <p className="text-gray-400 mt-2 text-lg font-medium">
                Across all connected platforms
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-100 mb-8">
                Connected Platforms
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {exchanges.map((ex) => (
                  <div
                    key={ex.name}
                    className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center hover:shadow-yellow-400 transition"
                  >
                    <h4 className="text-xl font-semibold text-yellow-400">
                      {ex.name}
                    </h4>
                    <p
                      className={`mt-2 font-semibold ${ex.connected ? "text-green-400" : "text-red-500"
                        }`}
                    >
                      {ex.connected ? "Connected" : "Disconnected"}
                    </p>
                    <p className="mt-2 text-gray-300 font-medium">
                      Portfolio Value: ₹{(ex.balancesValue || 0).toLocaleString()}
                    </p>
                    {ex.lastSync && (
                      <p className="mt-1 text-xs text-gray-500">
                        Last Sync: {ex.lastSync}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {currentSection === "Allocation" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-100 mb-8">
              Portfolio Allocation & Analytics
            </h2>

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

            <div className="flex flex-col md:flex-row gap-8">
              <div className="bg-gray-800 rounded-lg p-6 shadow flex-1 flex flex-col items-center min-h-[320px]">
                <h3 className="text-lg font-semibold mb-4 text-yellow-400">
                  Portfolio Distribution
                </h3>
                {filteredPortfolio.length === 0 ? (
                  <p className="text-gray-400 text-center italic">
                    No portfolio data.
                  </p>
                ) : (
                  <Pie data={pieData} />
                )}
              </div>
              <div className="bg-gray-800 rounded-lg p-6 shadow flex-1 flex flex-col items-center min-h-[320px]">
                <h3 className="text-lg font-semibold mb-4 text-yellow-400">
                  Portfolio Value Over Time
                </h3>
                <Line data={lineData} />
              </div>
            </div>
          </section>
        )}

        {currentSection === "Top Assets" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Top Assets</h2>
            <div className="overflow-x-auto rounded-xl shadow bg-gray-800">
              <table className="min-w-full divide-y divide-gray-700 text-white">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">
                      Value (₹)
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Platforms
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {topAssets.length > 0 ? (
                    topAssets.map((a) => (
                      <tr key={a.asset}>
                        <td className="px-6 py-4">{a.asset}</td>
                        <td className="px-6 py-4 text-right">{a.quantity}</td>
                        <td className="px-6 py-4 text-right">
                          ₹{a.value.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{a.platforms.join(", ")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-400 italic"
                      >
                        No assets available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {currentSection === "Recent Activity" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">
              Recent Activity
            </h2>
            <div className="overflow-x-auto rounded-xl shadow bg-gray-800">
              <table className="min-w-full divide-y divide-gray-700 text-white">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Exchange
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((act, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">{act.exchange}</td>
                        <td className="px-6 py-4">{act.type}</td>
                        <td className="px-6 py-4">{act.asset}</td>
                        <td className="px-6 py-4 text-right">{act.amount}</td>
                        <td className="px-6 py-4">{act.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-gray-400 italic"
                      >
                        No recent activity
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
