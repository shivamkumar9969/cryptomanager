"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${baseUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        setProfile(null);
      }
    };

    fetchProfile();
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
    </div>
  );
}
