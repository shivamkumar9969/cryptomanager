"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // NEW: for profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulated unread notifications count (replace with API)
    setUnreadCount(3);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/trading", label: "Trading" },
    { href: "/orders", label: "Orders" },
    { href: "/reports", label: "Reports" },
    { href: "/api-keys", label: "API Keys" },
    { href: "/help", label: "Help" },
  ];

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Brand */}
      <Link
        href="/"
        className="text-yellow-400 font-bold text-xl tracking-wide hover:scale-105 transition"
      >
        Crypto Manager
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-6">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`transition ${pathname === href
              ? "text-yellow-400 font-semibold"
              : "text-gray-300 hover:text-yellow-400"
              }`}
          >
            {label}
          </Link>
        ))}

        {/* Notifications */}
        <Link href="/notifications" className="relative text-gray-300 hover:text-yellow-400">
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-xs text-white rounded-full px-1">
              {unreadCount}
            </span>
          )}
        </Link>
        {/* Profile Dropdown (Click Toggle) */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setProfileOpen((prev) => !prev)}
            className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer"
            role="button"
            aria-label="Toggle profile menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A10.05 10.05 0 0112 15c2.485 0 4.766.992 6.379 2.604M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-700 text-gray-300"
                onClick={() => setProfileOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 hover:bg-gray-700 text-gray-300"
                onClick={() => setProfileOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 hover:bg-red-600 text-gray-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="text-gray-300 focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu Items */}
      {isMobileOpen && (
        <div className="absolute top-full left-0 w-full bg-gray-900 md:hidden z-40 flex flex-col border-t border-gray-700">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileOpen(false)}
              className={`px-6 py-3 border-b border-gray-800 ${pathname === href
                ? "text-yellow-400 font-semibold"
                : "text-gray-300 hover:text-yellow-400"
                }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/notifications"
            onClick={() => setIsMobileOpen(false)}
            className="px-6 py-3 border-b border-gray-800 flex justify-between items-center text-gray-300 hover:text-yellow-400"
          >
            Notifications{" "}
            {unreadCount > 0 && (
              <span className="bg-red-500 px-2 py-0.5 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/profile"
            onClick={() => setIsMobileOpen(false)}
            className="px-6 py-3 border-b border-gray-800 text-gray-300 hover:text-yellow-400"
          >
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsMobileOpen(false)}
            className="px-6 py-3 border-b border-gray-800 text-gray-300 hover:text-yellow-400"
          >
            Settings
          </Link>
          <button
            onClick={() => {
              setIsMobileOpen(false);
              logout();
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
