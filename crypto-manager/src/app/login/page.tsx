"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AuthTogglePage() {
  const router = useRouter();
  const [isRegisterView, setIsRegisterView] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const toggleView = (toRegister: boolean) => {
    if (toRegister === isRegisterView) return;
    setError("");
    setSuccessMessage("");
    setIsRegisterView(toRegister);
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${baseUrl}/api/auth/login`, {
        email: loginForm.email,
        password: loginForm.password,
      });
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await axios.post(`${baseUrl}/api/auth/register`, {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });
      setSuccessMessage("Registration successful! Redirecting to login...");
      // Clear registration form
      setRegisterForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      // Delay switching to login to show the success message
      setTimeout(() => {
        setSuccessMessage("");
        setIsRegisterView(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 relative">
      {/* Success message */}
      {successMessage && (
        <div className="absolute top-4 left-0 right-0 text-center text-green-400 font-semibold z-50 bg-gray-800 bg-opacity-90 py-2 rounded mx-4">
          {successMessage}
        </div>
      )}

      <div
        className="w-full max-w-5xl bg-gray-800 rounded-xl shadow-lg overflow-hidden grid grid-cols-2"
        style={{ minHeight: "480px" }}
      >
        {/* Left Side Container */}
        <div className="relative overflow-hidden border-r border-gray-700">
          <div
            className={`flex flex-col justify-center h-full px-16 py-20 text-white space-y-6 transition-transform duration-500 ease-in-out ${isRegisterView ? "-translate-x-full" : "translate-x-0"
              }`}
          >
            <h2 className="text-3xl font-extrabold">New here?</h2>
            <p className="text-gray-400 max-w-xs leading-relaxed">
              Don’t have an account? Create one and start managing your crypto portfolio securely.
            </p>
            <button
              onClick={() => toggleView(true)}
              className="py-3 px-10 rounded-full border border-yellow-500 text-yellow-500 font-semibold hover:bg-yellow-500 hover:text-gray-900 transition"
            >
              Register
            </button>
          </div>
          <div
            className={`flex flex-col justify-center h-full px-16 py-20 text-white space-y-6 transition-transform duration-500 ease-in-out absolute top-0 left-full w-full ${isRegisterView ? "translate-x-[-100%]" : "translate-x-0 hidden"
              }`}
          >
            <h2 className="text-3xl font-extrabold">Already have an account?</h2>
            <p className="text-gray-400 max-w-xs leading-relaxed">
              Log in to access your portfolio and manage your crypto assets securely.
            </p>
            <button
              onClick={() => toggleView(false)}
              className="py-3 px-10 rounded-full border border-yellow-500 text-yellow-500 font-semibold hover:bg-yellow-500 hover:text-gray-900 transition"
            >
              Login
            </button>
          </div>
        </div>

        {/* Right Side Container */}
        <div className="relative overflow-hidden">
          <form
            onSubmit={handleLoginSubmit}
            className={`flex flex-col justify-center h-full px-16 py-20 bg-gray-900 transition-transform duration-500 ease-in-out ${isRegisterView ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100 pointer-events-auto"
              }`}
            noValidate
          >
            <h2 className="text-3xl font-extrabold text-yellow-400 mb-8">Login to Your Account</h2>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={handleLoginChange}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-500 mb-6"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={handleLoginChange}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-500 mb-6"
            />
            {error && !isRegisterView && <p className="text-red-500 text-center mb-6">{error}</p>}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded font-bold transition"
            >
              Login
            </button>
          </form>

          <form
            onSubmit={handleRegisterSubmit}
            className={`flex flex-col justify-center h-full px-16 py-20 bg-gray-900 transition-transform duration-500 ease-in-out absolute inset-0 ${isRegisterView ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-[100%] opacity-0 pointer-events-none"
              }`}
            noValidate
          >
            <h2 className="text-3xl font-extrabold text-yellow-400 mb-8">Create an Account</h2>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={registerForm.name}
              onChange={handleRegisterChange}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-500 mb-6"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-500 mb-6"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-500 mb-6"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={registerForm.confirmPassword}
              onChange={handleRegisterChange}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-500 mb-6"
            />
            {error && isRegisterView && <p className="text-red-500 text-center mb-6">{error}</p>}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded font-bold transition"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

