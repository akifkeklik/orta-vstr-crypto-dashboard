import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  // order parametresi: asc | desc
  const orderParam = searchParams.get("order");
  const order = orderParam === "asc" ? "asc" : "desc";

  // CoinGecko endpoint
  const url =
    "https://api.coingecko.com/api/v3/coins/markets" +
    "?vs_currency=usd" +
    `&order=price_change_percentage_24h_${order}` +
    "&per_page=5" +
    "&page=1" +
    "&sparkline=false" +
    "&price_change_percentage=24h";

  try {
    const r = await fetch(url, {
      headers: {
        accept: "application/json",
      },

      // ⚠️ Cache izolasyonu: asc ve desc aynı cache’e düşmesin
      cache: "no-store",

      // Alternatif istersen:
      // next: { revalidate: 60 },
    });

    if (!r.ok) {
      console.error("CoinGecko API Error:", r.status);
      return NextResponse.json([], { status: r.status });
    }

    const data = await r.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Movers API crash:", err);
    return NextResponse.json([], { status: 500 });
  }
}
