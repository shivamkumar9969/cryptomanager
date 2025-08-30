"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface UserProfile {
  name: string;
  email: string;
  createdAt: string;
  totalTrades?: number;
  winRate?: number;
  exchangesConnected?: number;
}

type ApiKey = {
  _id: string;
  exchange: string;
  apiKey: string;
  createdAt: string;
};

const exchangesMeta: Record<string, { label: string; color: string; logo: string }> = {
  binance: { label: "Binance", color: "from-yellow-400 to-yellow-600", logo: "BN" },
  coindcx: { label: "CoinDCX", color: "from-blue-500 to-indigo-600", logo: "CD" },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorKeys, setErrorKeys] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProfile = async () => {
      setLoadingProfile(true);
      setErrorProfile(null);
      try {
        if (!token) throw new Error("No auth token");
        const res = await axios.get(`${baseUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch {
        setErrorProfile("Failed to load profile");
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchApiKeys = async () => {
      setLoadingKeys(true);
      setErrorKeys(null);
      try {
        if (!token) throw new Error("No auth token");
        const res = await axios.get<ApiKey[]>(`${baseUrl}/api/keys`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApiKeys(res.data);
      } catch {
        setErrorKeys("Failed to load API keys");
        setApiKeys([]);
      } finally {
        setLoadingKeys(false);
      }
    };

    fetchProfile();
    fetchApiKeys();
  }, []);

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400 font-mono text-lg">
        Loading profile...
      </div>
    );
  }
  if (errorProfile || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-mono text-lg">
        {errorProfile || "Profile data not available."}
      </div>
    );
  }

  const totalTrades = profile.totalTrades ?? 0;
  const winRate = profile.winRate ?? 0;
  const exchangesConnected = profile.exchangesConnected ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-gray-200 font-sans">
      {/* Top bar ticker */}
    

      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 w-24 h-24 flex items-center justify-center text-black font-extrabold text-5xl shadow-lg border-4 border-gray-900">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
                {profile.name}
              </h1>
              <p className="text-gray-400">{profile.email}</p>
              <p className="text-gray-500 mt-1 text-sm">
                Member since:{" "}
                <time dateTime={profile.createdAt}>
                  {new Date(profile.createdAt).toLocaleDateString()}
                </time>
              </p>
            </div>
          </div>
        </header>

        {/* Stats cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-yellow-600/40 shadow-xl hover:scale-105 transition">
            <p className="text-3xl font-extrabold text-yellow-400">{totalTrades}</p>
            <p className="uppercase text-xs font-semibold text-gray-400 mt-2 tracking-widest">
              Total Trades
            </p>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-green-600/40 shadow-xl hover:scale-105 transition">
            <p className="text-3xl font-extrabold text-green-400">{winRate.toFixed(2)}%</p>
            <p className="uppercase text-xs font-semibold text-gray-400 mt-2 tracking-widest">
              Win Rate
            </p>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-blue-600/40 shadow-xl hover:scale-105 transition">
            <p className="text-3xl font-extrabold text-blue-400">{exchangesConnected}</p>
            <p className="uppercase text-xs font-semibold text-gray-400 mt-2 tracking-widest">
              Exchanges
            </p>
          </div>
        </section>

        {/* API keys */}
        <section>
          <h2 className="text-2xl font-semibold text-yellow-400 mb-6 border-b border-yellow-600 pb-2">
            Connected API Keys
          </h2>
          {loadingKeys ? (
            <p className="text-gray-400 font-mono text-center">Loading API keys...</p>
          ) : errorKeys ? (
            <p className="text-red-500 font-mono text-center">{errorKeys}</p>
          ) : apiKeys.length === 0 ? (
            <p className="text-gray-500 font-mono text-center">
              No API keys connected yet.
            </p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-6">
              {apiKeys.map(({ _id, exchange, apiKey, createdAt }) => {
                const meta = exchangesMeta[exchange] || {
                  label: exchange,
                  color: "from-gray-700 to-gray-600",
                  logo: exchange.slice(0, 2).toUpperCase(),
                };
                return (
                  <li
                    key={_id}
                    className="relative bg-gray-900/60 backdrop-blur-md rounded-xl p-5 border border-gray-700 shadow-lg hover:border-yellow-500 hover:scale-[1.02] transition"
                  >
                    <div
                      className={`bg-gradient-to-tr ${meta.color} w-14 h-14 rounded-full flex items-center justify-center font-bold text-black shadow-md text-lg absolute -top-6 left-4`}
                      title={meta.label}
                    >
                      {meta.logo}
                    </div>
                    <div className="mt-10">
                      <p className="text-yellow-400 font-semibold">{meta.label}</p>
                      <code
                        className="block text-yellow-300 font-mono text-xs break-all mt-1 select-text"
                        title={apiKey}
                      >
                        {apiKey}
                      </code>
                      <p className="text-gray-500 text-xs mt-2">
                        Added: {new Date(createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
