import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids") || "";
  if (!ids.trim()) return NextResponse.json([], { status: 200 });

  const url =
    "https://api.coingecko.com/api/v3/coins/markets" +
    `?vs_currency=usd&ids=${encodeURIComponent(ids)}` +
    "&sparkline=false&price_change_percentage=24h";

  const r = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 60 }, // ✅ 60sn cache
  });

  const data = await r.json().catch(() => []);
  return NextResponse.json(data ?? [], { status: r.status });
}
