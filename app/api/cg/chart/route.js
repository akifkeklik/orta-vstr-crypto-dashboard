import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const days = searchParams.get("days") || "1";

  if (!id) return NextResponse.json({ prices: [] }, { status: 200 });

  const url =
    `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}` +
    `/market_chart?vs_currency=usd&days=${encodeURIComponent(days)}`;

  const r = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 180 }, // ✅ chart daha uzun cache
  });

  const data = await r.json().catch(() => ({ prices: [] }));
  return NextResponse.json(data ?? { prices: [] }, { status: r.status });
}
