"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type ApiKey = {
  _id: string;
  exchange: string;
  apiKey: string;
  createdAt: string;
};

const exchangesMeta = {
  binance: { label: "Binance", color: "bg-yellow-400", logo: "BN" },
  coindcx: { label: "CoinDCX", color: "bg-blue-400", logo: "CD" },
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ exchange: "binance", apiKey: "", apiSecret: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchKeys = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/keys`, {
        headers: { Authorization: `Bearer ${token}` || "" },
      });
      setKeys(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchKeys();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/keys/add`,
        {
          exchange: form.exchange,
          apiKey: form.apiKey,
          apiSecret: form.apiSecret,
        },
        { headers: { Authorization: `Bearer ${token}` || "" } }
      );
      setForm({ exchange: "binance", apiKey: "", apiSecret: "" });
      setSuccess("API Key added successfully!");
      fetchKeys();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add API key");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this API key?")) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/keys/${id}`, {
        headers: { Authorization: `Bearer ${token}` || "" },
      });
      setSuccess("API Key deleted.");
      fetchKeys();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete API key");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl mb-8 font-bold">API Keys Management</h1>

      {/* Add Key Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-gray-800/80 backdrop-blur-md rounded-2xl mb-10 shadow-lg max-w-lg"
      >
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Add New API Key</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Exchange</label>
            <select
              name="exchange"
              value={form.exchange}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none"
            >
              <option value="binance">Binance</option>
              <option value="coindcx">CoinDCX</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">API Key</label>
            <input
              type="text"
              name="apiKey"
              value={form.apiKey}
              onChange={handleChange}
              required
              placeholder="Paste API Key"
              className="w-full p-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">API Secret</label>
            <input
              type="password"
              name="apiSecret"
              value={form.apiSecret}
              onChange={handleChange}
              required
              placeholder="Paste API Secret"
              className="w-full p-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none"
            />
          </div>

          {error && <div className="bg-red-900 rounded px-4 py-2 text-red-300">{error}</div>}
          {success && <div className="bg-green-900 rounded px-4 py-2 text-green-300">{success}</div>}

          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-bold text-gray-900 transition w-full"
          >
            Add API Key
          </button>
        </div>
      </form>

      {/* List of Keys in full-width rows */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-yellow-400">Your API Keys</h2>
        {loading ? (
          <div className="flex items-center justify-center py-6 text-gray-300">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="bg-gray-800 rounded-xl px-4 py-6 text-gray-300 text-center">
            No API keys are saved yet.
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map(({ _id, exchange, apiKey, createdAt }) => {
              const meta = exchangesMeta[exchange as keyof typeof exchangesMeta] || {
                label: exchange,
                color: "bg-gray-500",
                logo: exchange.slice(0, 2).toUpperCase(),
              };
              return (
                <div
                  key={_id}
                  className="flex flex-col sm:flex-row sm:items-center bg-gray-800/90 rounded-xl shadow p-5 hover:shadow-yellow-500 transition gap-4"
                >
                  {/* Logo */}
                  <div className={`flex-shrink-0 flex items-center justify-center rounded-full ${meta.color} text-gray-900 font-bold text-lg w-12 h-12`}>
                    {meta.logo}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-yellow-400">{meta.label}</div>
                    <div className="text-xs text-gray-400 truncate">
                      Key: {apiKey}
                    </div>
                    <div className="text-xs text-gray-500">
                      Added: {new Date(createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleDelete(_id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
