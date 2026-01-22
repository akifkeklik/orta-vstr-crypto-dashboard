import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://api.coingecko.com/api/v3/search/trending";

  const r = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 300 },
  });

  const json = await r.json().catch(() => null);

  const raw = Array.isArray(json?.coins) ? json.coins.slice(0, 5) : [];
  const trending = raw.map((c) => ({
    id: c.item.id,
    symbol: String(c.item.symbol || "").toUpperCase(),
    name: c.item.name,
    image: c.item.small,
    rank: c.item.market_cap_rank,
    price: null,
    change24h: null,
  }));

  return NextResponse.json(trending, { status: r.status });
}
