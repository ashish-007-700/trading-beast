import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FinnhubCandles = {
  c: number[]; // close
  h: number[]; // high
  l: number[]; // low
  o: number[]; // open
  s: "ok" | "no_data";
  t: number[]; // timestamps (unix seconds)
  v: number[]; // volume
};

function getUnixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const symbol = url.searchParams.get("symbol")?.trim();
  const resolution = url.searchParams.get("resolution")?.trim() || "D";

  const now = new Date();
  const fromDays = Number(url.searchParams.get("days") || "30");
  const days = Number.isFinite(fromDays) && fromDays > 0 ? Math.min(fromDays, 365) : 30;

  const to = Number(url.searchParams.get("to")) || getUnixSeconds(now);
  const from =
    Number(url.searchParams.get("from")) ||
    getUnixSeconds(new Date(now.getTime() - days * 24 * 60 * 60 * 1000));

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

  const isCrypto = symbol.includes(":");
  const endpoint = isCrypto ? "crypto/candle" : "stock/candle";
  const upstreamUrl = new URL(`https://finnhub.io/api/v1/${endpoint}`);
  upstreamUrl.searchParams.set("symbol", symbol);
  upstreamUrl.searchParams.set("resolution", resolution);
  upstreamUrl.searchParams.set("from", String(from));
  upstreamUrl.searchParams.set("to", String(to));
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

  const data = (await upstreamResponse.json()) as FinnhubCandles;

  if (data.s !== "ok" || !Array.isArray(data.t) || !Array.isArray(data.c)) {
    return NextResponse.json(
      { error: "No candle data" },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const points = data.t.map((time, index) => ({
    t: time,
    c: data.c[index],
    o: data.o[index],
    h: data.h[index],
    l: data.l[index],
  }));

  return NextResponse.json(
    {
      symbol,
      resolution,
      from,
      to,
      points,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
