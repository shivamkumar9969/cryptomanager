"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Order {
  // You can expand shape with status, side, etc.
  id?: string;
  exchange: string;
  symbol?: string;
  market?: string;
  side?: string;
  type?: string;
  price?: number;
  quantity?: number;
  status?: string;
  time?: string;
  order_id?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeExchange, setActiveExchange] = useState("All");
  const [loading, setLoading] = useState(true);

  const exchangesList = ["All", "Binance", "CoinDCX"];

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        let allOrders: Order[] = [];

        if (activeExchange === "All") {
          for (const exchange of ["binance", "coindcx"]) {
            const query =
              exchange === "binance"
                ? { exchange, symbol: "BTCUSDT" }
                : { exchange, market: "btcusdt" };

            const res = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
              {
                params: query,
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            allOrders = allOrders.concat(res.data);
          }
        } else {
          const exchange = activeExchange.toLowerCase();
          const query =
            exchange === "binance"
              ? { exchange, symbol: "BTCUSDT" }
              : { exchange, market: "btcusdt" };

          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
            {
              params: query,
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          allOrders = res.data;
        }
        setOrders(allOrders);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeExchange]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="flex flex-wrap gap-4 mb-6">
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

      {/* Orders Table */}
      {loading ? (
        <div className="text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-400">No orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm uppercase">
                <th className="px-4 py-3 text-left">Exchange</th>
                <th className="px-4 py-3 text-left">
                  {activeExchange === "CoinDCX" ? "Market" : "Symbol"}
                </th>
                <th className="px-4 py-3 text-left">Side</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr
                  key={order.order_id || order.id || idx}
                  className="border-b border-gray-700 hover:bg-gray-700/50 text-sm"
                >
                  <td className="px-4 py-3">{order.exchange}</td>
                  <td className="px-4 py-3">{order.symbol || order.market}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${order.side === "BUY" || order.side === "buy"
                        ? "text-green-400"
                        : "text-red-400"
                      }`}
                  >
                    {order.side}
                  </td>
                  <td className="px-4 py-3">{order.type}</td>
                  <td className="px-4 py-3 text-right">{order.price}</td>
                  <td className="px-4 py-3 text-right">{order.quantity}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">
                    {order.time
                      ? new Date(order.time).toLocaleString()
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
