// src/app/layout.tsx
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Crypto Manager",
  description: "Manage all your crypto wallets in one place",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <Navbar />
        <main className="">{children}</main>
      </body>
    </html>
  );
}
