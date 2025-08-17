"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  createdAt: string;
  totalTrades: number;
  winRate: number;
  exchangesConnected: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // TODO: Replace with call to your backend to fetch profile
    const fakeData: UserProfile = {
      name: "John Doe",
      email: "john@example.com",
      createdAt: "2023-10-10T12:00:00Z",
      totalTrades: 248,
      winRate: 63.5,
      exchangesConnected: 2,
    };
    setProfile(fakeData);
  }, []);

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-gray-800 rounded-xl shadow p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0 w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center text-gray-900 font-bold text-3xl">
          {profile.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="text-xl font-semibold text-yellow-400">
              {profile.name}
            </h2>
            <p className="text-gray-400">{profile.email}</p>
          </div>
          <div className="text-sm text-gray-500">
            Member since:{" "}
            {new Date(profile.createdAt).toLocaleDateString()}
          </div>
          <Link
            href="/settings"
            className="inline-block mt-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition"
          >
            Edit Profile / Settings
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
        <div className="bg-gray-800 p-5 rounded-xl shadow text-center">
          <p className="text-gray-400 text-sm">Total Trades</p>
          <p className="text-2xl font-bold text-yellow-400">
            {profile.totalTrades}
          </p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl shadow text-center">
          <p className="text-gray-400 text-sm">Win Rate</p>
          <p className="text-2xl font-bold text-green-400">
            {profile.winRate}%
          </p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl shadow text-center">
          <p className="text-gray-400 text-sm">Connected Exchanges</p>
          <p className="text-2xl font-bold text-blue-400">
            {profile.exchangesConnected}
          </p>
        </div>
      </div>
    </div>
  );
}
