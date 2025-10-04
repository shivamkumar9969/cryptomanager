"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");

  // Separate exchange filter for each section
  const [activeExchange, setActiveExchange] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currency = localStorage.getItem("currency") || "USDT";
    setSelectedCurrency(currency);

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/summary`,
          { headers: { Authorization: `Bearer ${token}` }, params: { currency } }
        );

        const data = res.data.data;
        setTotalBalance(data.totalBalance || data.totalValue || 0);
        setExchanges(data.exchanges || []);
        setTopAssets(data.topAssets || []);
        setRecentActivity(data.recentActivity || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-400">Loading dashboard...</div>;
  if (error) return (
    <div className="flex flex-col justify-center items-center h-screen px-4 text-center">
      <h2 className="text-red-500 text-xl font-semibold mb-4">Error loading dashboard</h2>
      <p className="text-gray-400 max-w-md">{error}</p>
    </div>
  );

  const exchangesList = ["All", ...exchanges.map((ex) => ex.name)];

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

  // Filtered data for sections based on selected exchange
  const filteredBalanceExchanges = exchanges.filter(
    (ex) => activeExchange === "All" || ex.name === activeExchange
  );
  const filteredAssets = topAssets.filter(
    (a) => (activeExchange === "All" || a.platforms.includes(activeExchange)) &&
      (selectedCurrency === "INR" ? a.value >= 100 : a.value >= 1)
  );
  const filteredActivity = recentActivity.filter(
    (a) => activeExchange === "All" || a.exchange === activeExchange
  );

  // All assets for allocation chart
  const allocationAssets = topAssets.filter(
    (a) => activeExchange === "All" || a.platforms.includes(activeExchange)
  );

  const pieData = {
    labels: allocationAssets.map(a => a.asset),
    datasets: [
      {
        data: allocationAssets.map(a => a.value),
        backgroundColor: ["#facc15", "#60a5fa", "#34d399", "#f87171", "#a78bfa", "#fbbf24", "#22d3ee"],
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-800 p-6 flex flex-col">
        <h1 className="text-yellow-400 text-xl font-bold mb-8">Dashboard</h1>
        {SECTIONS.map((section) => (
          <SidebarItem key={section} name={section} />
        ))}
      </aside>

      {/* Main Section */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Exchange selector fixed for all sections */}
        {exchanges.length > 1 && (
          <div className="mb-6">
            <select
              value={activeExchange}
              onChange={(e) => setActiveExchange(e.target.value)}
              className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
            >
              {exchangesList.map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>
        )}

        {/* Balance Section */}
        {currentSection === "Balance" && (
          <section className="space-y-10">
            <div className="max-w-xl mx-auto bg-gray-800 rounded-xl p-10 text-center shadow-lg">
              <h2 className="text-3xl font-semibold text-yellow-400 mb-4">Total Portfolio Value</h2>
              <p className="text-6xl font-extrabold text-white tracking-tight">
                {selectedCurrency === "INR" ? "₹" : "$"}
                {totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-gray-400 mt-2 text-lg font-medium">Across selected platforms</p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-100 mb-8">Connected Platforms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredBalanceExchanges.map((ex) => (
                  <div key={ex.name} className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center hover:shadow-yellow-400 transition">
                    <h4 className="text-xl font-semibold text-yellow-400">{ex.name}</h4>
                    <p className={`mt-2 font-semibold ${ex.connected ? "text-green-400" : "text-red-500"}`}>
                      {ex.connected ? "Connected" : "Disconnected"}
                    </p>
                    <p className="mt-2 text-gray-300 font-medium">
                      Portfolio Value: {selectedCurrency === "INR" ? "₹" : "$"}
                      {(ex.balancesValue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    {ex.lastSync && <p className="mt-1 text-xs text-gray-500">Last Sync: {new Date(ex.lastSync).toLocaleString()}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Allocation Section */}
        {currentSection === "Allocation" && (
          <section className="p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Portfolio Allocation</h2>
            <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
              <Pie data={pieData} />
            </div>
          </section>
        )}

        {/* Top Assets Section */}
        {currentSection === "Top Assets" && (
          <section className="p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Top Assets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAssets.map(asset => (
                <div key={asset.asset} className="bg-gray-800 p-6 rounded-xl shadow hover:shadow-yellow-400 transition flex flex-col">
                  <h3 className="text-2xl font-semibold text-yellow-400">{asset.asset}</h3>
                  <p className="mt-2 text-gray-300 font-medium">Quantity: {asset.quantity.toFixed(6)}</p>
                  <p className="mt-1 text-gray-300 font-medium">Value: {selectedCurrency === "INR" ? "₹" : "$"}{asset.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Activity Section */}
        {currentSection === "Recent Activity" && (
          <section className="p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Recent Activity</h2>
            <div className="overflow-x-auto bg-gray-800 rounded-xl shadow">
              <table className="w-full text-left text-gray-300">
                <thead className="bg-gray-700 text-yellow-400">
                  <tr>
                    <th className="px-4 py-3">Exchange</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivity.map((act, idx) => (
                    <tr key={idx} className="border-b border-gray-700">
                      <td className="px-4 py-3">{act.exchange}</td>
                      <td className="px-4 py-3">{act.type}</td>
                      <td className="px-4 py-3">{act.asset}</td>
                      <td className="px-4 py-3">{act.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                      <td className="px-4 py-3">{new Date(act.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
