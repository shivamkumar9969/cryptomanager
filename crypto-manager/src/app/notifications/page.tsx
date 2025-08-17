"use client";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  message: string;
  type: "INFO" | "SUCCESS" | "ERROR" | "WARNING";
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with API call to fetch user's notifications
    const timer = setTimeout(() => {
      setNotifications([
        {
          id: "1",
          message: "Your order #1234 on Binance has been filled.",
          type: "SUCCESS",
          time: new Date().toISOString(),
          read: false,
        },
        {
          id: "2",
          message: "CoinDCX API key was added successfully.",
          type: "INFO",
          time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          read: true,
        },
        {
          id: "3",
          message:
            "Failed to connect to KuCoin API. Please verify your credentials.",
          type: "ERROR",
          time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          read: false,
        },
      ]);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "SUCCESS":
        return "bg-green-500 text-white";
      case "ERROR":
        return "bg-red-500 text-white";
      case "WARNING":
        return "bg-yellow-500 text-gray-900";
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-400 bg-gray-800 rounded-lg p-6 text-center">
          No notifications yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-4 bg-gray-800 rounded-lg p-4 shadow border ${
                n.read
                  ? "border-gray-700"
                  : "border-yellow-500 shadow-yellow-500/50"
              }`}
            >
              {/* Badge */}
              <span
                className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold ${getTypeColor(
                  n.type
                )}`}
              >
                {n.type}
              </span>

              {/* Content */}
              <div className="flex-1">
                <p
                  className={`${
                    n.read ? "text-gray-300" : "text-white font-semibold"
                  }`}
                >
                  {n.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(n.time).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
