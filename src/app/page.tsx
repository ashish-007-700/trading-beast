import { TradingViewWidget } from "@/components/TradingViewWidget";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-black dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Trading Beast</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Live charts powered by TradingView.
          </p>
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
            >
              Open dashboard
            </Link>
          </div>
        </header>

        <section className="rounded-lg bg-white p-3 dark:bg-black">
          <TradingViewWidget symbol="COINBASE:BTCUSD" theme="auto" />
        </section>
      </main>
    </div>
  );
}
