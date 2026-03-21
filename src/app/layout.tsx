import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Beast",
  description: "Trading Beast — live charts powered by TradingView.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="border-b border-zinc-200 bg-white text-black dark:border-zinc-800 dark:bg-black dark:text-zinc-50">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-3">
            <div className="text-sm font-semibold tracking-tight">
              Trading Beast
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
