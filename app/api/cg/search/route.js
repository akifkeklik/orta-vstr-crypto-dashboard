import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (q.trim().length < 2)
    return NextResponse.json({ coins: [] }, { status: 200 });

  const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(
    q,
  )}`;

  const r = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 120 },
  });

  const data = await r.json().catch(() => ({ coins: [] }));
  return NextResponse.json(data ?? { coins: [] }, { status: r.status });
}
