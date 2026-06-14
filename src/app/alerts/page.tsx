"use client";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getApiUrl } from '@/lib/apiUrl';

interface AlertItem {
    _id: string;
    type: string;
    symbol?: string;
    exchangeName: string;
    condition: string;
    threshold: number;
    currency: string;
    channels: string[];
    isActive: boolean;
    createdAt?: string;
}

const ALERT_TYPES = [
    { value: "price", label: "Price Alert" },
    { value: "portfolio_value", label: "Portfolio Value" },
    { value: "portfolio_drop", label: "Portfolio Drop" },
    { value: "exchange_disconnect", label: "Exchange Disconnect" },
];

const CONDITIONS = [
    { value: "above", label: "Above" },
    { value: "below", label: "Below" },
    { value: "drops_by_pct", label: "Drops by %" },
    { value: "rises_by_pct", label: "Rises by %" },
];

const EXCHANGES = ["all", "Binance", "CoinDCX"];
const CURRENCIES = ["USDT", "INR", "BTC"];
const CHANNELS = ["email", "push"];

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        type: "price",
        symbol: "BTCUSDT",
        exchangeName: "all",
        condition: "above",
        threshold: 0,
        currency: "USDT",
        channels: ["email", "push"],
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const res = await axios.get(getApiUrl("/api/alerts"), {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAlerts(Array.isArray(res.data.alerts) ? res.data.alerts : []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Unable to load alerts.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const updateForm = (field: string, value: string | number | string[]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const toggleChannel = (channel: string) => {
        setForm((prev) => {
            const channels = prev.channels.includes(channel)
                ? prev.channels.filter((item) => item !== channel)
                : [...prev.channels, channel];
            return { ...prev, channels };
        });
    };

    const createAlert = async () => {
        if (!token) return;
        setSaving(true);

        try {
            await axios.post(getApiUrl("/api/alerts"), form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setForm({
                type: "price",
                symbol: "BTCUSDT",
                exchangeName: "all",
                condition: "above",
                threshold: 0,
                currency: "USDT",
                channels: ["email", "push"],
            });
            await fetchAlerts();
        } catch (err) {
            console.error(err);
            setError("Unable to create alert.");
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (alert: AlertItem) => {
        if (!token) return;
        try {
            await axios.patch(getApiUrl(`/api/alerts/${alert._id}`), {
                isActive: !alert.isActive,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAlerts((prev) => prev.map((item) => item._id === alert._id ? { ...item, isActive: !item.isActive } : item));
        } catch (err) {
            console.error(err);
            setError("Unable to update alert.");
        }
    };

    const deleteAlert = async (alertId: string) => {
        if (!token) return;
        try {
            await axios.delete(getApiUrl(`/api/alerts/${alertId}`), {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAlerts((prev) => prev.filter((item) => item._id !== alertId));
        } catch (err) {
            console.error(err);
            setError("Unable to delete alert.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Alerts</h1>
                    <p className="text-gray-400 mt-2">Create and manage price & portfolio alerts.</p>
                </div>
                <div className="rounded-3xl border border-gray-800 bg-gray-900 px-5 py-4 shadow-xl">
                    <p className="text-sm text-gray-400">Active alerts</p>
                    <p className="text-3xl font-semibold text-white">{alerts.filter((item) => item.isActive).length}</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border border-red-600 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
                <div className="space-y-6">
                    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">Alerts list</h2>
                                <p className="text-gray-500 text-sm">Manage your alert rules and activity.</p>
                            </div>
                            {loading && <span className="text-gray-400">Loading...</span>}
                        </div>

                        {alerts.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-gray-700 p-10 text-center text-gray-400">
                                No alerts configured.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {alerts.map((alert) => (
                                    <div key={alert._id} className="rounded-3xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{ALERT_TYPES.find((t) => t.value === alert.type)?.label || alert.type}</h3>
                                                <p className="text-gray-400 text-sm">
                                                    {alert.exchangeName !== "all" ? `${alert.exchangeName} · ` : "All exchanges · "}
                                                    {alert.symbol ? `${alert.symbol} · ` : ""}
                                                    {ALERT_TYPES.find((t) => t.value === alert.type)?.value === "exchange_disconnect" ? "Disconnect alert" : `${alert.condition} ${alert.threshold} ${alert.currency}`}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => toggleActive(alert)}
                                                    className={`rounded-full px-4 py-2 text-xs font-semibold ${alert.isActive ? "bg-emerald-500 text-black" : "bg-gray-700 text-gray-200"}`}
                                                >
                                                    {alert.isActive ? "Active" : "Paused"}
                                                </button>
                                                <button
                                                    onClick={() => deleteAlert(alert._id)}
                                                    className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-black hover:bg-rose-400"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-300">
                                            {alert.channels.map((channel) => (
                                                <span key={channel} className="rounded-full bg-gray-800 px-3 py-1">{channel}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <aside className="space-y-6">
                    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
                        <h2 className="text-xl font-semibold mb-4">Create new alert</h2>

                        <div className="space-y-4">
                            <label className="block text-sm text-gray-300">
                                Alert type
                                <select
                                    value={form.type}
                                    onChange={(e) => updateForm("type", e.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                >
                                    {ALERT_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="block text-sm text-gray-300">
                                Exchange
                                <select
                                    value={form.exchangeName}
                                    onChange={(e) => updateForm("exchangeName", e.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                >
                                    {EXCHANGES.map((name) => (
                                        <option key={name} value={name}>{name === "all" ? "All exchanges" : name}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="block text-sm text-gray-300">
                                Symbol
                                <input
                                    value={form.symbol}
                                    onChange={(e) => updateForm("symbol", e.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                    placeholder="BTCUSDT"
                                />
                            </label>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm text-gray-300">
                                    Condition
                                    <select
                                        value={form.condition}
                                        onChange={(e) => updateForm("condition", e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                    >
                                        {CONDITIONS.map((item) => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-sm text-gray-300">
                                    Threshold
                                    <input
                                        type="number"
                                        value={form.threshold}
                                        onChange={(e) => updateForm("threshold", Number(e.target.value))}
                                        className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                        placeholder="100"
                                    />
                                </label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm text-gray-300">
                                    Currency
                                    <select
                                        value={form.currency}
                                        onChange={(e) => updateForm("currency", e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                                    >
                                        {CURRENCIES.map((cur) => (
                                            <option key={cur} value={cur}>{cur}</option>
                                        ))}
                                    </select>
                                </label>
                                <div className="block text-sm text-gray-300">
                                    Channels
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {CHANNELS.map((channel) => (
                                            <button
                                                key={channel}
                                                type="button"
                                                onClick={() => toggleChannel(channel)}
                                                className={`rounded-2xl border px-4 py-2 text-xs font-semibold transition ${form.channels.includes(channel)
                                                    ? "border-yellow-400 bg-yellow-500 text-black"
                                                    : "border-gray-700 bg-gray-950 text-gray-300"
                                                    }`}
                                            >
                                                {channel}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={createAlert}
                                disabled={saving}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-black font-semibold hover:bg-yellow-400 transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Create alert"}
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
