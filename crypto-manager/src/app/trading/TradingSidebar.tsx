// src/app/trading/TradingSidebar.tsx
"use client";

interface TradingSidebarProps {
  exchanges: string[];
  active: string;
  onSelect: (name: string) => void;
}

export default function TradingSidebar({ exchanges, active, onSelect }: TradingSidebarProps) {
  return (
    <aside className="bg-gray-900 w-64 min-h-screen p-6 border-r border-gray-800 hidden md:block">
      <h2 className="text-lg font-semibold mb-4">Exchanges</h2>
      <ul className="space-y-2">
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
