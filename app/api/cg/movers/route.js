import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  const url =
    "https://api.coingecko.com/api/v3/coins/markets" +
    "?vs_currency=usd" +
    `&order=price_change_percentage_24h_${order}` +
    "&per_page=5&page=1&sparkline=false&price_change_percentage=24h";

  const r = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 300 },
  });

  const data = await r.json().catch(() => []);
  return NextResponse.json(data ?? [], { status: r.status });
}
