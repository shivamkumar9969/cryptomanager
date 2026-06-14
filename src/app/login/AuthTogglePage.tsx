"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AuthTogglePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<
    "login" | "register" | "otp" | "forgot" | "reset"
  >("login");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");

  // Forgot/reset
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Auto-detect reset token & email from URL
  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (token && email) {
      setResetToken(token);
      setResetEmail(email);
      setView("reset");
    }
  }, [searchParams]);

  const toggleView = (toRegister: boolean) => {
    if (view === "otp") return;
    setError("");
    setSuccessMessage("");
    setView(toRegister ? "register" : "login");
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  // Login
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError("Please enter both email and password.");
      return; // stop the request
    }
    try {
      console.log('base url: ', baseUrl);
      const res = await axios.post(`/api/auth/login`, {
        email: loginForm.email,
        password: loginForm.password,
      });
      console.log('res data');
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
          setError((err.response?.data as { message?: string })?.message || "Login Failed");
        } else {
          setError("Login failed");
        }
    }
  };

  // Register
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await axios.post(`/api/auth/register`, {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });
      setSuccessMessage("OTP sent to your email. Please enter the OTP.");
      setView("otp");
    } 
    catch (err) {
      if (axios.isAxiosError(err)) {
          setError((err.response?.data as { message?: string })?.message || "Registration Failed");
        } else {
          setError("Registration failed");
        }
    }
  };

  // OTP
  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      await axios.post(`/api/auth/verify-otp`, {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        otp,
      });
      setSuccessMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        setView("login");
        setRegisterForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setOtp("");
        setError("");
        setSuccessMessage("");
      }, 2000);
    }
    catch (err) {
      if (axios.isAxiosError(err)) {
          setError((err.response?.data as { message?: string })?.message || "OTP Varifaction Failed");
        } else {
          setError("OTP varfication failed");
        }
    }
  };

  // Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      await axios.post(`/api/auth/forgot-password`, {
        email: forgotEmail,
      });
      setSuccessMessage("Reset link sent to your email");
      setView("login");
    }
    catch (err) {
      if (axios.isAxiosError(err)) {
          setError((err.response?.data as { message?: string })?.message || "Failed to send reset link");
        } else {
          setError("Failed to send reset link");
        }
    }
  };

  // Reset Password
  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      await axios.post(`/api/auth/reset-password`, {
        email: resetEmail,
        token: resetToken,
        newPassword,
      });
      setSuccessMessage("Password reset successful! Please login.");
      setTimeout(() => {
        setView("login");
        setResetEmail("");
        setResetToken("");
        setNewPassword("");
      }, 2000);
    } 
    catch (err) {
      if (axios.isAxiosError(err)) {
          setError((err.response?.data as { message?: string })?.message || "Failed to reset password");
        } else {
          setError("Failed to reset password");
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 relative">
      {successMessage && (
        <div className="absolute top-4 left-0 right-0 text-center text-green-400 font-semibold z-50 bg-gray-800 bg-opacity-90 py-2 rounded mx-4">
          {successMessage}
        </div>
      )}

      <div
        className="w-full max-w-5xl bg-gray-800 rounded-xl shadow-lg overflow-hidden grid grid-cols-2"
        style={{ minHeight: "480px" }}
      >
        {/* Left container */}
        <div className="relative overflow-hidden border-r border-gray-700">
          <div
            className={`flex flex-col justify-center h-full px-16 py-20 text-white space-y-6 transition-transform duration-500 ease-in-out ${
              view === "register" ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <h2 className="text-3xl font-extrabold">New here?</h2>
            <p className="text-gray-400 max-w-xs leading-relaxed">
              Don’t have an account? Create one and start managing your crypto
              portfolio securely.
            </p>
            <button
              onClick={() => toggleView(true)}
              className="py-3 px-10 rounded-full border border-yellow-500 text-yellow-500 font-semibold hover:bg-yellow-500 hover:text-gray-900 transition"
            >
              Register
            </button>
          </div>
          <div
            className={`flex flex-col justify-center h-full px-16 py-20 text-white space-y-6 transition-transform duration-500 ease-in-out absolute top-0 left-full w-full ${
              view === "register"
                ? "translate-x-[-100%]"
                : "translate-x-0 hidden"
            }`}
          >
            <h2 className="text-3xl font-extrabold">Already have an account?</h2>
            <p className="text-gray-400 max-w-xs leading-relaxed">
              Log in to access your portfolio and manage your crypto assets
              securely.
            </p>
            <button
              onClick={() => toggleView(false)}
              className="py-3 px-10 rounded-full border border-yellow-500 text-yellow-500 font-semibold hover:bg-yellow-500 hover:text-gray-900 transition"
            >
              Login
            </button>
          </div>
        </div>

        {/* Right Forms */}
        <div className="relative overflow-hidden">
          {/* Login */}
          <form
            onSubmit={handleLoginSubmit}
            
            className={`flex flex-col justify-center h-full px-16 py-20 bg-gray-900 transition-transform duration-500 ease-in-out ${
              view !== "login"
                ? "translate-x-full opacity-0 pointer-events-none"
                : "translate-x-0 opacity-100 pointer-events-auto"
            }`}
            noValidate={false}
          >
            <h2 className="text-3xl font-extrabold text-yellow-400 mb-8">
              Login to Your Account
            </h2>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={handleLoginChange}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 placeholder-gray-400 text-white mb-6 caret-yellow-400"
            />
            <div className="relative mb-3">
              <input
                type={showLoginPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 placeholder-gray-400 text-white pr-12 caret-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400"
              >
                {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p
              className="text-sm text-yellow-400 cursor-pointer mb-6"
              onClick={() => setView("forgot")}
            >
              Forgot password?
            </p>
            {error && view === "login" && (
              <p className="text-red-500 text-center mb-6">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded font-bold transition"
            >
              Login
            </button>
          </form>

          {/* Register */}
          <form
            onSubmit={handleRegisterSubmit}
            className={`flex flex-col justify-center h-full px-16 py-20 bg-gray-900 transition-transform duration-500 ease-in-out absolute inset-0 ${
              view === "register"
                ? "translate-x-0 opacity-100 pointer-events-auto"
                : "translate-x-[100%] opacity-0 pointer-events-none"
            }`}
            noValidate
          >
            <h2 className="text-3xl font-extrabold text-yellow-400 mb-8">
              Create an Account
            </h2>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={registerForm.name}
              onChange={handleRegisterChange}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 text-white mb-6 caret-yellow-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 text-white mb-6 caret-yellow-400"
            />
            <div className="relative mb-6">
              <input
                type={showRegisterPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
                className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 text-white pr-12 caret-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 "
              >
                {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative mb-6">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
                required
                className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 text-white pr-12 caret-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && view === "register" && (
              <p className="text-red-500 text-center mb-6">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded font-bold transition"
            >
              Register
            </button>
          </form>

          {/* OTP */}
          <form
            onSubmit={handleOtpSubmit}
            className={`flex flex-col justify-center h-full px-16 py-20 bg-gray-900 transition-transform duration-500 ease-in-out absolute inset-0 ${
              view === "otp"
                ? "translate-x-0 opacity-100 pointer-events-auto"
                : "translate-x-[100%] opacity-0 pointer-events-none"
            }`}
            noValidate
          >
            <h2 className="text-3xl font-extrabold text-yellow-400 mb-8">
              Verify Email
            </h2>
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              required
              maxLength={6}
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 text-white mb-6 caret-yellow-400"
            />
            {error && view === "otp" && (
              <p className="text-red-500 text-center mb-6">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded font-bold transition"
            >
              Verify OTP
            </button>
          </form>

          {/* Forgot Password */}
          <form
            onSubmit={handleForgotSubmit}
            className={`flex flex-col justify-center h-full px-16 py-20 bg-gray-900 absolute inset-0 transition-transform duration-500 ease-in-out ${
              view === "forgot"
                ? "translate-x-0 opacity-100 pointer-events-auto"
                : "translate-x-[100%] opacity-0 pointer-events-none"
            }`}
          >
            <h2 className="text-3xl font-extrabold text-yellow-400 mb-8">
              Forgot Password
            </h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 text-white mb-6 caret-yellow-400"
            />
            {error && view === "forgot" && (
              <p className="text-red-500 text-center mb-6">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded font-bold transition"
            >
              Send Reset Link
            </button>
            <p
              className="text-sm text-gray-400 mt-4 cursor-pointer text-center"
              onClick={() => setView("login")}
            >
              Back to login
            </p>
          </form>

          {/* Reset Password */}
          <form
            onSubmit={handleResetSubmit}
            className={`flex flex-col justify-center h-full px-16 py-20 bg-gray-900 absolute inset-0 transition-transform duration-500 ease-in-out ${
              view === "reset"
                ? "translate-x-0 opacity-100 pointer-events-auto"
                : "translate-x-[100%] opacity-0 pointer-events-none"
            }`}
          >
            <h2 className="text-3xl font-extrabold text-yellow-400 mb-8">
              Reset Password
            </h2>
            <input
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 text-white mb-6 caret-yellow-400"
            />
            <input
              type="text"
              placeholder="Reset Token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
              className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 text-white mb-6 caret-yellow-400"
            />
            <div className="relative mb-6">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-4 rounded-md bg-gray-800 border border-gray-700 text-white pr-12 caret-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>         

            {error && view === "otp" && <p className="text-red-500 text-center mb-6">{error}</p>}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded font-bold transition"
            >
              Verify OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
