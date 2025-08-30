"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;


export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      console.log(baseUrl);
      await axios.post(`${baseUrl}/api/auth/register`, form);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold mb-4">Register</h1>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-700 border border-gray-600"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-700 border border-gray-600"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-700 border border-gray-600"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 rounded font-bold text-gray-900"
        >
          Register
        </button>
      </form>
    </div>
  );
}
