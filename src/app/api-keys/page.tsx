"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";
const getApiUrl = (path: string) => `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;

type ApiKey = {
  _id: string;
  exchange: string;
  apiKey: string;
  createdAt: string;
};

const exchangesMeta: Record<
  string,
  { label: string; color: string; logo: string }
> = {
  binance: { label: "Binance", color: "bg-yellow-500", logo: "BN" },
  coindcx: { label: "CoinDCX", color: "bg-blue-500", logo: "CD" },
};

function ApiKeyEntry({
  meta,
  apiKey,
  createdAt,
  onDelete,
}: {
  meta: { label: string; color: string; logo: string };
  apiKey: string;
  createdAt: string;
  onDelete: () => void;
}) {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <li
      className="flex items-center justify-between py-4 px-3 rounded-lg hover:bg-gray-700 transition cursor-default select-none"
      role="listitem"
    >
      <div className="flex items-center space-x-4">
        <div
          className={`${meta.color} rounded-full w-10 h-10 flex items-center justify-center font-bold text-gray-900 select-none`}
          title={meta.label}
        >
          {meta.logo}
        </div>
        <div className="min-w-0">
          <p className="text-md font-semibold text-indigo-300">{meta.label}</p>
          <div className="flex items-center space-x-2">
            <code className="text-sm font-mono text-indigo-400 break-words select-text max-w-xs">
              {apiKey}
            </code>
            <button
              type="button"
              onClick={copyToClipboard}
              title="Copy API Key"
              aria-label="Copy API Key"
              className="text-indigo-400 hover:text-indigo-200 focus:outline-none"
            >
              📋
            </button>
            {copySuccess && (
              <span className="text-green-400 text-xs ml-1 select-none">Copied!</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Added: {new Date(createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md font-medium transition focus:outline-none"
        aria-label={`Delete API key for ${meta.label}`}
      >
        Delete
      </button>
    </li>
  );
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    exchange: "binance",
    apiKey: "",
    apiSecret: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  const fetchKeys = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get<ApiKey[]>(
        getApiUrl("/api/keys"),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setKeys(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError((err.response?.data as { message?: string })?.message || "Failed to load API keys");
      } else {
        setError("Failed to load API keys");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchKeys();
  }, [token, fetchKeys]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("You must be logged in");
      return;
    }
    setError("");
    setSuccess("");
    try {
      await axios.post(
        getApiUrl("/api/keys/add"),
        {
          exchange: form.exchange,
          apiKey: form.apiKey,
          apiSecret: form.apiSecret,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ exchange: "binance", apiKey: "", apiSecret: "" });
      setSuccess("API Key added successfully!");
      fetchKeys();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError((err.response?.data as { message?: string })?.message || "Failed to add API keys");
      } else {
        setError("Failed to add API keys");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      setError("You must be logged in");
      return;
    }
    if (!confirm("Delete this API key?")) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(getApiUrl(`/api/keys/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("API Key deleted.");
      fetchKeys();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError((err.response?.data as { message?: string })?.message || "Failed to delete api key");
      } else {
        setError("Failed to load delete api key");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-indigo-400">
            API Keys Management
          </h1>
          <p className="text-gray-400">Securely add and manage your exchange API keys.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Add API Key box */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-400">Add New API Key</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="exchange" className="block mb-1 font-medium text-gray-300">
                  Exchange
                </label>
                <select
                  name="exchange"
                  id="exchange"
                  value={form.exchange}
                  onChange={handleChange}
                  className="w-full border border-gray-600 rounded-md p-2 bg-gray-900 text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="binance">Binance</option>
                  <option value="coindcx">CoinDCX</option>
                </select>
              </div>

              <div>
                <label htmlFor="apiKey" className="block mb-1 font-medium text-gray-300">
                  API Key
                </label>
                <input
                  type="text"
                  id="apiKey"
                  name="apiKey"
                  value={form.apiKey}
                  onChange={handleChange}
                  placeholder="Paste your API Key"
                  required
                  className="w-full rounded-md border border-gray-600 p-2 bg-gray-900 text-indigo-200 placeholder-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="apiSecret" className="block mb-1 font-medium text-gray-300">
                  API Secret
                </label>
                <input
                  type="password"
                  id="apiSecret"
                  name="apiSecret"
                  value={form.apiSecret}
                  onChange={handleChange}
                  placeholder="Paste your API Secret"
                  required
                  className="w-full rounded-md border border-gray-600 p-2 bg-gray-900 text-indigo-200 placeholder-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div
                  className="bg-red-900 border border-red-700 text-red-400 px-4 py-2 rounded relative"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="bg-green-900 border border-green-700 text-green-400 px-4 py-2 rounded relative"
                  role="alert"
                >
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition"
              >
                Add API Key
              </button>
            </form>
          </section>

          {/* Right: How to get API keys info */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-400">How to Get API Keys</h2>
            <div className="text-gray-300 text-sm space-y-6">
              <div>
                <h3 className="text-yellow-400 font-semibold mb-2">Binance</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Log in to your Binance account.</li>
                  <li>Navigate to User Center &gt; API Management.</li>
                  <li>Create a new API key with a recognizable label.</li>
                  <li>Complete necessary security verification (2FA, email).</li>
                  <li>Copy API key and secret; keep them secure.</li>
                </ol>
              </div>
              <div>
                <h3 className="text-yellow-400 font-semibold mb-2">CoinDCX</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Log in to your CoinDCX account.</li>
                  <li>Go to Account Settings &gt; API.</li>
                  <li>Create a new API key and set permissions.</li>
                  <li>Complete security verification.</li>
                  <li>Copy generated API key and secret securely.</li>
                </ol>
              </div>
            </div>
          </section>
        </div>

        {/* Existing API keys below spanning full width */}
        <section className="mt-10 bg-gray-800 rounded-lg border border-gray-700 p-6 shadow-md max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-indigo-400">Your API Keys</h2>
          {loading ? (
            <p className="text-indigo-300">Loading...</p>
          ) : keys.length === 0 ? (
            <p className="text-gray-500">No API keys saved yet.</p>
          ) : (
            <ol className="divide-y divide-gray-700 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800" role="list">
              {keys.map(({ _id, exchange, apiKey, createdAt }) => {
                const meta =
                  exchangesMeta[exchange] || {
                    label: exchange,
                    color: "bg-gray-600",
                    logo: exchange.slice(0, 2).toUpperCase(),
                  };
                return (
                  <ApiKeyEntry
                    key={_id}
                    meta={meta}
                    apiKey={apiKey}
                    createdAt={createdAt}
                    onDelete={() => handleDelete(_id)}
                  />
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
