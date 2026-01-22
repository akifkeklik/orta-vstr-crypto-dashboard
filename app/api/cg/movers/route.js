import { NextResponse } from "next/server";

// ✅ Prod'da cache yüzünden gainers/losers aynı kalmasın diye:
// Bu route her istekte dinamik çalışır.
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderParam = searchParams.get("order");
    const order = orderParam === "asc" ? "asc" : "desc";

    const url =
      "https://api.coingecko.com/api/v3/coins/markets" +
      "?vs_currency=usd" +
      `&order=price_change_percentage_24h_${order}` +
      "&per_page=5&page=1&sparkline=false&price_change_percentage=24h";

    const r = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store", // ✅ Edge/Next cache kapat
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return NextResponse.json(
        { error: "CoinGecko request failed", status: r.status, details: text },
        { status: r.status },
      );
    }

    const data = await r.json().catch(() => []);
    return NextResponse.json(Array.isArray(data) ? data : [], {
      status: 200,
      headers: {
        // ✅ Vercel CDN cache kapat
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Unexpected server error", message: String(e?.message || e) },
      { status: 500 },
    );
  }
}
