// src/app/portfolio/PortfolioSidebar.tsx
"use client";
import { usePathname } from "next/navigation";

interface PortfolioSidebarProps {
  exchanges: string[];
  active: string;
  onSelect: (exchange: string) => void;
}

export default function PortfolioSidebar({ exchanges, active, onSelect }: PortfolioSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="bg-gray-900 w-64 min-h-screen p-6 border-r border-gray-800 hidden md:block">
      <h2 className="text-lg font-semibold mb-4">Exchanges</h2>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelect("All")}
            className={`w-full text-left px-3 py-2 rounded-md ${
              active === "All"
                ? "bg-yellow-500 text-gray-900 font-semibold"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            All
          </button>
        </li>
        {exchanges.map((name) => (
          <li key={name}>
            <button
              onClick={() => onSelect(name)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                active === name
                  ? "bg-yellow-500 text-gray-900 font-semibold"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
