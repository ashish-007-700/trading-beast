import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FinnhubQuote = {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol")?.trim();

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing required query param: symbol" },
      { status: 400 }
    );
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing FINNHUB_API_KEY. Add it to .env.local (do not commit secrets).",
      },
      { status: 500 }
    );
  }

  const upstreamUrl = new URL("https://finnhub.io/api/v1/quote");
  upstreamUrl.searchParams.set("symbol", symbol);
  upstreamUrl.searchParams.set("token", apiKey);

  const upstreamResponse = await fetch(upstreamUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!upstreamResponse.ok) {
    const text = await upstreamResponse.text().catch(() => "");
    return NextResponse.json(
      {
        error: `Finnhub request failed (${upstreamResponse.status})`,
        details: text || undefined,
      },
      { status: 502 }
    );
  }

  const data = (await upstreamResponse.json()) as FinnhubQuote;

  return NextResponse.json(
    {
      symbol,
      quote: data,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
