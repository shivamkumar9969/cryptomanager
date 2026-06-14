"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const links = [
    { href: "/portfolio", label: "Portfolio Overview" },
    { href: "/portfolio/history", label: "Transaction History" },
    { href: "/portfolio/settings", label: "Portfolio Settings" },
  ];

  return (
    <aside className="bg-gray-900 w-64 min-h-screen p-6 border-r border-gray-800 hidden md:block">
      <ul className="space-y-3">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`block px-3 py-2 rounded-md transition ${
                pathname === href
                  ? "bg-yellow-500 text-gray-900 font-semibold"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
