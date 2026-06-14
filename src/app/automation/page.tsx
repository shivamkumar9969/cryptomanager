"use client";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getApiUrl } from '@/lib/apiUrl';
import { Loader2, Play, Pause, Square, PlusCircle } from "lucide-react";

interface Bot {
    _id: string;
    name: string;
    description?: string;
    exchangeName: string;
    symbol: string;
    strategy: string;
    status: "active" | "paused" | "stopped";
    budget: number;
    tradeCount?: number;
    winRate?: number;
    totalPnl?: number;
    createdAt?: string;
}

const STRATEGIES = [
    { value: "dca", label: "DCA" },
    { value: "grid", label: "Grid" },
    { value: "rsi", label: "RSI" },
    { value: "macd", label: "MACD" },
    { value: "trailing_stop", label: "Trailing Stop" },
    { value: "webhook", label: "Webhook" },
];

const EXCHANGES = ["Binance", "CoinDCX"];

export default function AutomationPage() {
    const [bots, setBots] = useState<Bot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        exchangeName: "Binance",
        symbol: "BTCUSDT",
        strategy: "dca",
        budget: 50,
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchBots = useCallback(async () => {
        setLoading(true);
        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const res = await axios.get(getApiUrl("/api/bots"), {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBots(Array.isArray(res.data.bots) ? res.data.bots : []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Unable to load automation bots.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchBots();
    }, [fetchBots]);

    const handleFormChange = (field: string, value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateBot = async () => {
        if (!token) {
            window.location.href = "/login";
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                budget: Number(form.budget),
                config: {},
            };
            await axios.post(getApiUrl("/api/bots"), payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setForm({ name: "", description: "", exchangeName: "Binance", symbol: "BTCUSDT", strategy: "dca", budget: 50 });
            await fetchBots();
        } catch (err) {
            console.error(err);
            setError("Unable to create bot.");
        } finally {
            setSaving(false);
        }
    };

    const setBotStatus = async (id: string, action: "start" | "pause" | "stop") => {
        if (!token) return;
        try {
            await axios.post(getApiUrl(`/api/bots/${id}/${action}`), {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchBots();
        } catch (err) {
            console.error(err);
            setError(`Unable to ${action} bot.`);
        }
    };

    const getStatusLabel = (status: Bot["status"]) => {
        switch (status) {
            case "active":
                return "Active";
            case "paused":
                return "Paused";
            default:
                return "Stopped";
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Automation</h1>
                    <p className="text-gray-400 mt-2">Manage trading bots and automation rules.</p>
                </div>
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
                <div className="bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">Your Bots</h2>
                            <p className="text-gray-500">View active automation and performance summary.</p>
                        </div>
                        {loading && <Loader2 className="animate-spin w-6 h-6 text-yellow-400" />}
                    </div>

                    {error && <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500 p-4 text-sm text-red-300">{error}</div>}

                    {bots.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-gray-700 p-10 text-center text-gray-400">
                            No automation bots configured yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bots.map((bot) => (
                                <div key={bot._id} className="rounded-3xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
                                            <p className="text-gray-400 text-sm">{bot.description || "No description provided."}</p>
                                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-300">
                                                <span className="rounded-full bg-gray-800 px-3 py-1">{bot.exchangeName}</span>
                                                <span className="rounded-full bg-gray-800 px-3 py-1">{bot.symbol}</span>
                                                <span className="rounded-full bg-gray-800 px-3 py-1">{bot.strategy.toUpperCase()}</span>
                                                <span className="rounded-full bg-gray-800 px-3 py-1">Budget: ${bot.budget.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs uppercase tracking-wide text-gray-200">
                                                {getStatusLabel(bot.status)}
                                            </span>
                                            <button
                                                onClick={() => setBotStatus(bot._id, "start")}
                                                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition"
                                            >
                                                <Play className="w-4 h-4" /> Start
                                            </button>
                                            <button
                                                onClick={() => setBotStatus(bot._id, "pause")}
                                                className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-3 py-2 text-xs font-semibold text-black hover:bg-yellow-400 transition"
                                            >
                                                <Pause className="w-4 h-4" /> Pause
                                            </button>
                                            <button
                                                onClick={() => setBotStatus(bot._id, "stop")}
                                                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-black hover:bg-rose-400 transition"
                                            >
                                                <Square className="w-4 h-4" /> Stop
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="space-y-6">
                    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-2xl bg-yellow-500 p-2 text-black">
                                <PlusCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Create bot</h2>
                                <p className="text-gray-500 text-sm">Quickly add a new automation bot.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm text-gray-300">
                                Name
                                <input
                                    value={form.name}
                                    onChange={(e) => handleFormChange("name", e.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                    placeholder="My DCA Bot"
                                />
                            </label>

                            <label className="block text-sm text-gray-300">
                                Description
                                <input
                                    value={form.description}
                                    onChange={(e) => handleFormChange("description", e.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                    placeholder="Buy BTC every week"
                                />
                            </label>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm text-gray-300">
                                    Exchange
                                    <select
                                        value={form.exchangeName}
                                        onChange={(e) => handleFormChange("exchangeName", e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                    >
                                        {EXCHANGES.map((exchange) => (
                                            <option key={exchange} value={exchange}>{exchange}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-sm text-gray-300">
                                    Strategy
                                    <select
                                        value={form.strategy}
                                        onChange={(e) => handleFormChange("strategy", e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                    >
                                        {STRATEGIES.map((strategy) => (
                                            <option key={strategy.value} value={strategy.value}>{strategy.label}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm text-gray-300">
                                    Symbol
                                    <input
                                        value={form.symbol}
                                        onChange={(e) => handleFormChange("symbol", e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                        placeholder="BTCUSDT"
                                    />
                                </label>

                                <label className="block text-sm text-gray-300">
                                    Budget
                                    <input
                                        type="number"
                                        value={form.budget}
                                        onChange={(e) => handleFormChange("budget", Number(e.target.value))}
                                        className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                        placeholder="50"
                                    />
                                </label>
                            </div>

                            <button
                                onClick={handleCreateBot}
                                disabled={saving || !form.name.trim()}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-black font-semibold hover:bg-yellow-400 transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                                Create bot
                            </button>
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    );
}
