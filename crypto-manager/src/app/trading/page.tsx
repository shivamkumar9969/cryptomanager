"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import TradingSidebar from "./TradingSidebar";

export default function TradingPage() {
  const [exchanges] = useState(["Binance", "CoinDCX"]);
  const [activeExchange, setActiveExchange] = useState("Binance");
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [orderType, setOrderType] = useState("Market");
  const [side, setSide] = useState("BUY");
  const [feedback, setFeedback] = useState("");

  const placeOrder = async () => {
    setFeedback("");
    try {
      const token = localStorage.getItem("token");
      // Map frontend form fields to correct backend fields:
      let payload;

      if (activeExchange === "Binance") {
        payload = {
          exchange: "binance",
          symbol: symbol.toUpperCase(),
          side,
          type: orderType.toUpperCase(),
          quantity,
          ...(orderType === "Limit" && { price })
        };
      } else if (activeExchange === "CoinDCX") {
        payload = {
          exchange: "coindcx",
          symbol: symbol.toLowerCase(), // CoinDCX wants lowercase
          side: side.toLowerCase(),     // CoinDCX wants lowercase
          type: orderType.toLowerCase(),
          quantity,
          ...(orderType === "Limit" && { price })
        };
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/place`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback("Order placed!");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFeedback((err.response?.data as { message?: string })?.message || "Order Failed");
      } else {
        setFeedback("Order Failed");
      }

    }
  };

  return (
    <div className="flex">
      <TradingSidebar
        exchanges={exchanges}
        active={activeExchange}
        onSelect={setActiveExchange}
      />

      {/* Main content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">
          Trading – {activeExchange}
        </h1>

        <div className="bg-gray-800 p-6 rounded-lg mb-6 max-w-lg">
          <h2 className="text-lg font-semibold mb-4">Place Order</h2>
          {/* Symbol/Market input */}
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">
              {activeExchange === "Binance" ? "Symbol (BTCUSDT)" : "Market (btcusdt)"}
            </label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder={activeExchange === "Binance" ? "e.g. BTCUSDT" : "e.g. btcusdt"}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 focus:outline-none"
            />
          </div>

          {/* Side */}
          <div className="mb-3 flex gap-4">
            <label className="block text-gray-400">Side:</label>
            <button
              type="button"
              className={`px-3 py-1 rounded ${side === "BUY" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}
              onClick={() => setSide("BUY")}
            >
              Buy
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded ${side === "SELL" ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300"}`}
              onClick={() => setSide("SELL")}
            >
              Sell
            </button>
          </div>

          {/* Order type */}
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 focus:outline-none"
            >
              <option>Market</option>
              <option>Limit</option>
            </select>
          </div>

          {orderType === "Limit" && (
            <div className="mb-3">
              <label className="block text-sm text-gray-400 mb-1">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 focus:outline-none"
              />
            </div>
          )}

          {/* Quantity */}
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 focus:outline-none"
            />
          </div>

          {feedback && (
            <div className="text-sm font-semibold text-yellow-400 mt-2">{feedback}</div>
          )}

          <button
            onClick={placeOrder}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded font-semibold w-full transition mt-3"
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}
