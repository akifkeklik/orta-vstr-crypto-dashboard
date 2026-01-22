"use client";

import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Flame,
  Globe,
  LayoutDashboard,
  LineChart,
  Menu,
  Minus,
  Moon,
  RefreshCcw,
  Sun,
  TrendingDown,
  TrendingUp,
  Wifi,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * =========================================================
 *  SUPABASE (ANON KEY: read-only via RLS policy)
 * =========================================================
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/**
 * =========================================================
 *  TIMEFRAMES (UI + math)
 * =========================================================
 */
const TIMEFRAMES = [
  { key: "1H", label: "1H", windowMs: 60 * 60 * 1000, kind: "SHORT" },
  { key: "24H", label: "24H", windowMs: 24 * 60 * 60 * 1000, kind: "SHORT" },
  { key: "7D", label: "7D", windowMs: 7 * 24 * 60 * 60 * 1000, kind: "LONG" },
  {
    key: "30D",
    label: "30D",
    windowMs: 30 * 24 * 60 * 60 * 1000,
    kind: "LONG",
  },
  { key: "3M", label: "3M", windowMs: 90 * 24 * 60 * 60 * 1000, kind: "LONG" },
  { key: "6M", label: "6M", windowMs: 180 * 24 * 60 * 60 * 1000, kind: "LONG" },
  { key: "1Y", label: "1Y", windowMs: 365 * 24 * 60 * 60 * 1000, kind: "LONG" },
];

const DEFAULT_TF = "24H";

/**
 * =========================================================
 *  COIN CONFIG
 *  - LOCAL: VSTR / ORTA via Supabase rows
 *  - GLOBAL: CoinGecko coin ids
 * =========================================================
 */
const COIN_CONFIG = {
  // Local assets
  VSTR: {
    id: "VSTR",
    type: "LOCAL",
    symbol: "VSTR",
    name: "Vestra Token",
    matchRow: (row) => {
      const n = String(row?.coin_adi ?? "").toUpperCase();
      return n.includes("VSTR") || n.includes("VESTRA");
    },
  },
  ORTA: {
    id: "ORTA",
    type: "LOCAL",
    symbol: "ORTA",
    name: "ORTA Chain",
    matchRow: (row) => {
      const n = String(row?.coin_adi ?? "").toUpperCase();
      return n.includes("ORTA");
    },
  },

  // Global assets (CoinGecko IDs)
  bitcoin: { id: "bitcoin", type: "GLOBAL", symbol: "BTC", name: "Bitcoin" },
  ethereum: { id: "ethereum", type: "GLOBAL", symbol: "ETH", name: "Ethereum" },
  solana: { id: "solana", type: "GLOBAL", symbol: "SOL", name: "Solana" },
  binancecoin: {
    id: "binancecoin",
    type: "GLOBAL",
    symbol: "BNB",
    name: "BNB",
  },
  ripple: { id: "ripple", type: "GLOBAL", symbol: "XRP", name: "Ripple" },
  "avalanche-2": {
    id: "avalanche-2",
    type: "GLOBAL",
    symbol: "AVAX",
    name: "Avalanche",
  },
};

const SIDEBAR_GLOBAL = [
  "bitcoin",
  "ethereum",
  "solana",
  "binancecoin",
  "ripple",
  "avalanche-2",
].map((id) => ({
  id,
  symbol: COIN_CONFIG[id].symbol,
  name: COIN_CONFIG[id].name,
}));

/**
 * =========================================================
 *  ICONS (Local tokens)
 * =========================================================
 */
const VstrLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 17L12 22L22 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const OrtaLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 2V22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M2 12H22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="12"
      cy="12"
      r="4"
      fill="currentColor"
      className="animate-pulse"
    />
  </svg>
);

/**
 * =========================================================
 *  FORMATTERS (en-US)
 * =========================================================
 */
const formatCurrency = (v) => {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "---";
  const n = Number(v);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n < 1 ? 6 : 2,
    maximumFractionDigits: n < 1 ? 6 : 2,
  }).format(n);
};

const formatUsdCompact = (v) => {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "---";
  const n = Number(v);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
};

const formatPercentSigned = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0.00%";
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}${Math.abs(n).toFixed(2)}%`;
};

const smartTickFormatter = (ts, tfKey) => {
  const d = new Date(ts);
  if (tfKey === "1H" || tfKey === "24H") {
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
};

const formatRangeLabel = (startTs, endTs, tfKey) => {
  if (!startTs || !endTs) return null;
  const start = new Date(startTs);
  const end = new Date(endTs);

  if (tfKey === "1H" || tfKey === "24H") {
    const s = start.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const e = end.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${s} → ${e}`;
  }

  const s = start.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const e = end.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  return `${s} → ${e}`;
};

const getTrendStatus = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n) || n === 0) {
    return {
      color: "text-slate-400",
      hex: "#94a3b8",
      sign: "",
      icon: Minus,
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
    };
  }
  if (n > 0) {
    return {
      color: "text-emerald-500",
      hex: "#10b981",
      sign: "+",
      icon: ArrowUpRight,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    };
  }
  return {
    color: "text-rose-500",
    hex: "#f43f5e",
    sign: "-",
    icon: ArrowDownRight,
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  };
};

/**
 * =========================================================
 *  SERIES HELPERS
 * =========================================================
 */
const clampLastN = (arr, n) =>
  arr.length <= n ? arr : arr.slice(arr.length - n);

const computePctChange = (start, end) => {
  const s = Number(start);
  const e = Number(end);
  if (!Number.isFinite(s) || !Number.isFinite(e) || s === 0) return 0;
  return ((e - s) / s) * 100;
};

const findFirstPointAtOrAfter = (series, ts) => {
  if (!series.length) return null;
  let lo = 0;
  let hi = series.length - 1;
  let ans = null;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (series[mid].ts >= ts) {
      ans = series[mid];
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  return ans ?? series[0];
};

const sliceSeriesForWindow = (series, endTs, windowMs) => {
  if (!series.length) return { sliced: [], sinceLabel: null };
  const earliestTs = series[0].ts;
  const wantedStart = endTs - windowMs;
  const effectiveStart = Math.max(wantedStart, earliestTs);

  const sliced = series.filter((p) => p.ts >= effectiveStart && p.ts <= endTs);
  const sinceLabel =
    earliestTs > wantedStart
      ? `Data available since ${new Date(earliestTs).toLocaleDateString(
          "en-US",
        )}`
      : null;

  return { sliced, sinceLabel };
};

const normalizeLocalRowsToSeries = (rows) =>
  rows
    .map((r) => ({
      ts: new Date(r.created_at).getTime(),
      val: Number(r.fiyat),
      comment: r.ai_yorumu ?? null,
    }))
    .filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.val))
    .sort((a, b) => a.ts - b.ts);

/**
 * =========================================================
 *  GLOBAL SINGLETON CACHE + BACKOFF (client-side)
 *  (CoinGecko now comes through /api/cg/* so rate-limit is much less)
 * =========================================================
 */
const GLOBAL_CACHE = {
  marketById: new Map(),
  chartByKey: new Map(),
  movers: { ts: 0, data: { trending: [], gainers: [], losers: [] } },
  backoffUntilById: new Map(),
};

const TTL_MARKET_MS = 60_000;
const TTL_CHART_MS = 60_000;
const TTL_MOVERS_MS = 300_000;
const BACKOFF_ON_429_MS = 75_000;

const coingeckoFetch = async (url, { signal } = {}) => {
  // url artık /api/cg/... (server tarafında cache var)
  const res = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
    signal,
  });
  return res;
};

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const getCached = (map, key, ttlMs) => {
  const entry = map.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) return null;
  return entry.data;
};

const setCached = (map, key, data) => map.set(key, { ts: Date.now(), data });

/**
 * =========================================================
 *  MAIN PAGE
 * =========================================================
 */
export default function CoinMeterProPage() {
  /**
   * ----------------------------
   * UI state
   * ----------------------------
   */
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  /**
   * Persist theme/sidebar (enterprise UX)
   */
  useEffect(() => {
    try {
      const dm = localStorage.getItem("cm_darkMode");
      const sb = localStorage.getItem("cm_sidebarOpen");

      if (dm !== null) setDarkMode(dm === "1");
      else {
        const prefersDark =
          typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
        setDarkMode(prefersDark ?? true);
      }

      if (sb !== null) setSidebarOpen(sb === "1");
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("cm_darkMode", darkMode ? "1" : "0");
    } catch {}
  }, [darkMode, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("cm_sidebarOpen", isSidebarOpen ? "1" : "0");
    } catch {}
  }, [isSidebarOpen, mounted]);

  /**
   * ----------------------------
   * Active asset
   * ----------------------------
   */
  const [activeAsset, setActiveAsset] = useState(() => ({
    id: "VSTR",
    type: "LOCAL",
    symbol: "VSTR",
    name: "Vestra Token",
    image: null,
  }));

  const [selectedTfKey, setSelectedTfKey] = useState(DEFAULT_TF);

  /**
   * ----------------------------
   * Data state
   * ----------------------------
   */
  const [currentPrice, setCurrentPrice] = useState(null);
  const [cardsByTf, setCardsByTf] = useState(() => ({}));
  const [chartData, setChartData] = useState([]);
  const [analysisText, setAnalysisText] = useState(null);
  const [sinceLabel, setSinceLabel] = useState(null);

  // small “pro” meta (global market)
  const [marketMeta, setMarketMeta] = useState(null);

  /**
   * ----------------------------
   * Status / Loading
   * ----------------------------
   */
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  const [livePaused, setLivePaused] = useState(false);
  const [statusText, setStatusText] = useState(null);

  /**
   * ----------------------------
   * Local master buffer
   * ----------------------------
   */
  const [localMasterRows, setLocalMasterRows] = useState([]);
  const localLastTsRef = useRef(null);
  const localChannelRef = useRef(null);
  const [localOlderLoading, setLocalOlderLoading] = useState(false);

  /**
   * ----------------------------
   * Global series
   * ----------------------------
   */
  const [globalSeries, setGlobalSeries] = useState({ short: [], long: [] });

  /**
   * ----------------------------
   * Abort + request sequencing
   * ----------------------------
   */
  const globalAbortRef = useRef(null);
  const globalReqSeqRef = useRef(0);

  /**
   * ----------------------------
   * Header movers
   * ----------------------------
   */
  const [movers, setMovers] = useState({
    trending: [],
    gainers: [],
    losers: [],
  });
  const [moversLoading, setMoversLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownWrapRef = useRef(null);

  /**
   * ----------------------------
   * Sidebar Icons (GLOBAL)
   * ----------------------------
   */
  const [sidebarImages, setSidebarImages] = useState({});

  /**
   * ----------------------------
   * Sidebar Search
   * ----------------------------
   */
  const [coinSearch, setCoinSearch] = useState("");
  const [coinSearchResults, setCoinSearchResults] = useState([]);
  const searchAbortRef = useRef(null);

  /**
   * =========================================================
   * THEME
   * =========================================================
   */
  const theme = useMemo(() => {
    const hover = darkMode ? "hover:bg-white/5" : "hover:bg-slate-900/5";
    return {
      bg: darkMode ? "bg-[#020202]" : "bg-[#F6F7FB]",
      text: darkMode ? "text-white" : "text-slate-900",
      sidebarBg: darkMode ? "bg-[#050505]" : "bg-white/70",
      headerBg: darkMode ? "bg-[#050505]/90" : "bg-white/70",
      cardBg: darkMode ? "bg-[#09090b]" : "bg-white/70",
      cardSolid: darkMode ? "bg-[#09090b]" : "bg-white",
      border: darkMode ? "border-white/5" : "border-slate-200/70",
      hover,
      subtleText: darkMode ? "text-white/60" : "text-slate-500",
      activeItem: darkMode
        ? "bg-blue-600/10 border-blue-600/50 text-blue-500"
        : "bg-indigo-500/10 border-indigo-500/30 text-indigo-700",
    };
  }, [darkMode]);

  /**
   * =========================================================
   * DROPDOWN OUTSIDE CLICK
   * =========================================================
   */
  useEffect(() => {
    const onDown = (e) => {
      if (!openDropdown) return;
      if (!dropdownWrapRef.current) return;
      if (!dropdownWrapRef.current.contains(e.target)) setOpenDropdown(null);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [openDropdown]);

  /**
   * =========================================================
   * ASSET SELECT
   * =========================================================
   */
  const selectAsset = useCallback((id, metaOverride = null) => {
    const cfg = COIN_CONFIG[id];
    if (cfg) {
      setActiveAsset({
        id: cfg.id,
        type: cfg.type,
        symbol: cfg.symbol,
        name: cfg.name,
        image: metaOverride?.image ?? null,
      });
      setSelectedTfKey(DEFAULT_TF);
      setStatusText(null);
      setLivePaused(false);
      setLoading(true);
      setChartLoading(true);
      setMarketMeta(null);
      return;
    }

    if (metaOverride && metaOverride.type === "GLOBAL") {
      setActiveAsset({
        id,
        type: "GLOBAL",
        symbol: metaOverride.symbol ?? id.toUpperCase(),
        name: metaOverride.name ?? id,
        image: metaOverride.image ?? null,
      });
      setSelectedTfKey(DEFAULT_TF);
      setStatusText(null);
      setLivePaused(false);
      setLoading(true);
      setChartLoading(true);
      setMarketMeta(null);
    }
  }, []);

  /**
   * =========================================================
   * LOCAL ENGINE
   *  - initial: small (500)
   *  - realtime: websocket subscribe (NO polling)
   *  - load older: button
   * =========================================================
   */
  const fetchLocalInitial = useCallback(async () => {
    const { data, error } = await supabase
      .from("kripto_analiz")
      .select("coin_adi,fiyat,ai_yorumu,created_at")
      .order("created_at", { ascending: false })
      .limit(500); // ✅ 5000 -> 500

    if (error) throw error;

    const desc = Array.isArray(data) ? data : [];
    const asc = desc.slice().reverse();
    localLastTsRef.current = asc.length ? asc[asc.length - 1].created_at : null;
    setLocalMasterRows(asc);
    return asc;
  }, []);

  const fetchLocalOlder = useCallback(async () => {
    if (!localMasterRows.length) return;
    const oldest = localMasterRows[0]?.created_at;
    if (!oldest) return;

    setLocalOlderLoading(true);
    try {
      const { data, error } = await supabase
        .from("kripto_analiz")
        .select("coin_adi,fiyat,ai_yorumu,created_at")
        .lt("created_at", oldest)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      const desc = Array.isArray(data) ? data : [];
      if (!desc.length) return;

      const asc = desc.slice().reverse();
      setLocalMasterRows((prev) => [...asc, ...prev]);
    } finally {
      setLocalOlderLoading(false);
    }
  }, [localMasterRows]);

  // initial load once
  useEffect(() => {
    (async () => {
      try {
        await fetchLocalInitial();
      } catch {
        // non-fatal
      }
    })();
  }, [fetchLocalInitial]);

  // ✅ Supabase Realtime subscribe (polling yok)
  useEffect(() => {
    if (!mounted) return;

    try {
      if (localChannelRef.current) {
        supabase.removeChannel(localChannelRef.current);
      }
    } catch {}

    const channel = supabase
      .channel("kripto_analiz_inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "kripto_analiz" },
        (payload) => {
          const row = payload?.new;
          if (!row?.created_at) return;

          setLocalMasterRows((prev) => {
            const last = prev[prev.length - 1];
            // basit dedupe
            if (last?.created_at === row.created_at) return prev;

            const merged = clampLastN([...prev, row], 5000);
            localLastTsRef.current =
              merged[merged.length - 1]?.created_at ?? localLastTsRef.current;
            return merged;
          });
        },
      )
      .subscribe();

    localChannelRef.current = channel;

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  }, [mounted]);

  const computeLocalView = useCallback(
    (tfKey) => {
      const cfg = COIN_CONFIG[activeAsset.id];
      if (!cfg || cfg.type !== "LOCAL") return;

      const tokenRows = localMasterRows.filter(cfg.matchRow);
      const series = normalizeLocalRowsToSeries(tokenRows);

      if (!series.length) {
        setCurrentPrice(null);
        setCardsByTf({});
        setChartData([]);
        setAnalysisText(null);
        setSinceLabel(null);
        setMarketMeta(null);
        setLoading(false);
        setChartLoading(false);
        return;
      }

      const end = series[series.length - 1];
      const endTs = end.ts;

      // Cards for all timeframes
      const cards = {};
      for (const tf of TIMEFRAMES) {
        const startWanted = endTs - tf.windowMs;
        const startPoint = findFirstPointAtOrAfter(
          series,
          Math.max(startWanted, series[0].ts),
        );
        const change = computePctChange(startPoint?.val, end.val);

        const since =
          series[0].ts > startWanted
            ? `Data available since ${new Date(series[0].ts).toLocaleDateString(
                "en-US",
              )}`
            : null;

        cards[tf.key] = { change, sinceLabel: since };
      }

      // Visible chart
      const tf = TIMEFRAMES.find((x) => x.key === tfKey) ?? TIMEFRAMES[1];
      const { sliced, sinceLabel: tfSince } = sliceSeriesForWindow(
        series,
        endTs,
        tf.windowMs,
      );

      // Local “meta”
      const last24h = series.filter((p) => p.ts >= endTs - 24 * 60 * 60 * 1000);
      const hi24 = last24h.length
        ? Math.max(...last24h.map((x) => x.val))
        : null;
      const lo24 = last24h.length
        ? Math.min(...last24h.map((x) => x.val))
        : null;

      setMarketMeta({
        lastUpdatedTs: endTs,
        high24h: hi24,
        low24h: lo24,
      });

      setCurrentPrice(end.val);
      setCardsByTf(cards);
      setChartData(sliced);
      setAnalysisText(end.comment ?? "Market analysis active...");
      setSinceLabel(tfSince);
      setLoading(false);
      setChartLoading(false);
    },
    [activeAsset.id, localMasterRows],
  );

  /**
   * =========================================================
   * GLOBAL ENGINE (CoinGecko via /api/cg/*)
   * =========================================================
   */
  const abortGlobalInFlight = useCallback(() => {
    try {
      globalAbortRef.current?.abort?.();
    } catch {}
    globalAbortRef.current = null;
  }, []);

  const fetchGlobalMarket = useCallback(async (coinId, signal) => {
    const cached = getCached(GLOBAL_CACHE.marketById, coinId, TTL_MARKET_MS);
    if (cached) return cached;

    const backoffUntil = GLOBAL_CACHE.backoffUntilById.get(coinId) ?? 0;
    if (Date.now() < backoffUntil) return null;

    const res = await coingeckoFetch(
      `/api/cg/markets?ids=${encodeURIComponent(coinId)}`,
      { signal },
    );

    if (res.status === 429) {
      GLOBAL_CACHE.backoffUntilById.set(coinId, Date.now() + BACKOFF_ON_429_MS);
      return { __rate_limited: true };
    }
    if (!res.ok) return null;

    const json = await safeJson(res);
    const item = Array.isArray(json) && json[0] ? json[0] : null;
    if (!item) return null;

    setCached(GLOBAL_CACHE.marketById, coinId, item);
    return item;
  }, []);

  const fetchGlobalChart = useCallback(async (coinId, days, signal) => {
    const key = `${coinId}|${days}`;
    const cached = getCached(GLOBAL_CACHE.chartByKey, key, TTL_CHART_MS);
    if (cached) return cached;

    const backoffUntil = GLOBAL_CACHE.backoffUntilById.get(coinId) ?? 0;
    if (Date.now() < backoffUntil) return null;

    const res = await coingeckoFetch(
      `/api/cg/chart?id=${encodeURIComponent(coinId)}&days=${encodeURIComponent(
        String(days),
      )}`,
      { signal },
    );

    if (res.status === 429) {
      GLOBAL_CACHE.backoffUntilById.set(coinId, Date.now() + BACKOFF_ON_429_MS);
      return { __rate_limited: true };
    }
    if (!res.ok) return null;

    const json = await safeJson(res);
    const prices = Array.isArray(json?.prices) ? json.prices : [];

    const series = prices
      .map((p) => ({ ts: Number(p[0]), val: Number(p[1]) }))
      .filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.val))
      .sort((a, b) => a.ts - b.ts);

    setCached(GLOBAL_CACHE.chartByKey, key, series);
    return series;
  }, []);

  const computeGlobalCardsAndChart = useCallback(
    (tfKey, shortSeries, longSeries, marketItem) => {
      const tf = TIMEFRAMES.find((x) => x.key === tfKey) ?? TIMEFRAMES[1];

      const useShort = tf.kind === "SHORT";
      const baseSeries = useShort ? shortSeries : longSeries;

      const endPoint = baseSeries?.length
        ? baseSeries[baseSeries.length - 1]
        : null;
      const endTs = endPoint?.ts ?? Date.now();
      const endVal = endPoint?.val ?? marketItem?.current_price ?? null;

      // Build cards for all timeframes
      const cards = {};
      const endTsShort = shortSeries?.length
        ? shortSeries[shortSeries.length - 1].ts
        : endTs;
      const endTsLong = longSeries?.length
        ? longSeries[longSeries.length - 1].ts
        : endTs;

      for (const t of TIMEFRAMES) {
        const s = t.kind === "SHORT" ? shortSeries : longSeries;
        if (!s?.length) {
          cards[t.key] = { change: 0, sinceLabel: null };
          continue;
        }
        const endT = t.kind === "SHORT" ? endTsShort : endTsLong;
        const startWanted = endT - t.windowMs;
        const startPoint = findFirstPointAtOrAfter(
          s,
          Math.max(startWanted, s[0].ts),
        );
        const change = computePctChange(startPoint?.val, s[s.length - 1].val);
        const since =
          s[0].ts > startWanted
            ? `Data available since ${new Date(s[0].ts).toLocaleDateString(
                "en-US",
              )}`
            : null;
        cards[t.key] = { change, sinceLabel: since };
      }

      // Visible chart
      const { sliced, sinceLabel: tfSince } = sliceSeriesForWindow(
        baseSeries ?? [],
        endTs,
        tf.windowMs,
      );

      // Pro meta
      if (marketItem) {
        setMarketMeta({
          marketCap: marketItem.market_cap ?? null,
          volume24h: marketItem.total_volume ?? null,
          high24h: marketItem.high_24h ?? null,
          low24h: marketItem.low_24h ?? null,
          change24h: marketItem.price_change_percentage_24h ?? null,
          lastUpdated: marketItem.last_updated ?? null,
        });
      } else {
        setMarketMeta(null);
      }

      setCardsByTf(cards);
      setChartData(sliced);
      setSinceLabel(tfSince);
      setCurrentPrice(endVal ?? marketItem?.current_price ?? null);
      setAnalysisText("Market analysis active...");
      setLoading(false);
      setChartLoading(false);
    },
    [],
  );

  const hydrateGlobal = useCallback(
    async (coinId) => {
      abortGlobalInFlight();

      const reqId = ++globalReqSeqRef.current;
      const controller = new AbortController();
      globalAbortRef.current = controller;

      const cachedShort =
        getCached(GLOBAL_CACHE.chartByKey, `${coinId}|1`, TTL_CHART_MS) ?? [];
      const cachedLong =
        getCached(GLOBAL_CACHE.chartByKey, `${coinId}|365`, TTL_CHART_MS) ?? [];
      const cachedMarket = getCached(
        GLOBAL_CACHE.marketById,
        coinId,
        TTL_MARKET_MS,
      );

      if (cachedMarket || (cachedShort.length && cachedLong.length)) {
        setGlobalSeries({ short: cachedShort, long: cachedLong });
        computeGlobalCardsAndChart(
          selectedTfKey,
          cachedShort,
          cachedLong,
          cachedMarket ?? null,
        );
      } else {
        setChartLoading(true);
        setLoading(true);
      }

      try {
        const backoffUntil = GLOBAL_CACHE.backoffUntilById.get(coinId) ?? 0;
        if (Date.now() < backoffUntil) {
          setLivePaused(true);
          setStatusText("Live Feed Paused - Retrying...");
          setLoading(false);
          setChartLoading(false);
          return;
        }

        const [market, shortSeries, longSeries] = await Promise.all([
          fetchGlobalMarket(coinId, controller.signal),
          fetchGlobalChart(coinId, 1, controller.signal),
          fetchGlobalChart(coinId, 365, controller.signal),
        ]);

        if (controller.signal.aborted) return;
        if (reqId !== globalReqSeqRef.current) return;

        if (
          market?.__rate_limited ||
          shortSeries?.__rate_limited ||
          longSeries?.__rate_limited
        ) {
          setLivePaused(true);
          setStatusText("Live Feed Paused - Retrying...");
          setLoading(false);
          setChartLoading(false);
          return;
        }

        if (
          !market &&
          (!shortSeries || !shortSeries.length) &&
          (!longSeries || !longSeries.length)
        ) {
          setLivePaused(true);
          setStatusText("Live Feed Paused - Retrying...");
          setLoading(false);
          setChartLoading(false);
          return;
        }

        setLivePaused(false);
        setStatusText(null);

        const s = Array.isArray(shortSeries) ? shortSeries : [];
        const l = Array.isArray(longSeries) ? longSeries : [];

        setGlobalSeries({ short: s, long: l });
        computeGlobalCardsAndChart(selectedTfKey, s, l, market ?? null);
      } catch {
        if (controller.signal.aborted) return;
        setLivePaused(true);
        setStatusText("Live Feed Paused - Retrying...");
        setLoading(false);
        setChartLoading(false);
      }
    },
    [
      abortGlobalInFlight,
      computeGlobalCardsAndChart,
      fetchGlobalChart,
      fetchGlobalMarket,
      selectedTfKey,
    ],
  );

  /**
   * =========================================================
   * SIDEBAR GLOBAL ICONS (fetch once)
   * =========================================================
   */
  useEffect(() => {
    (async () => {
      try {
        const ids = SIDEBAR_GLOBAL.map((c) => c.id).join(",");
        const res = await coingeckoFetch(
          `/api/cg/markets?ids=${encodeURIComponent(ids)}`,
        );
        const json = await safeJson(res);
        const arr = Array.isArray(json) ? json : [];
        const map = Object.fromEntries(arr.map((x) => [x.id, x.image]));
        setSidebarImages(map);
      } catch {
        // non-fatal
      }
    })();
  }, []);

  /**
   * =========================================================
   * SIDEBAR SEARCH (debounce + abort)
   * =========================================================
   */
  useEffect(() => {
    const q = coinSearch.trim();
    if (q.length < 2) {
      setCoinSearchResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        searchAbortRef.current?.abort?.();
        const controller = new AbortController();
        searchAbortRef.current = controller;

        const res = await coingeckoFetch(
          `/api/cg/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        const json = await safeJson(res);
        const coins = Array.isArray(json?.coins) ? json.coins.slice(0, 8) : [];

        setCoinSearchResults(
          coins.map((c) => ({
            id: c.id,
            symbol: String(c.symbol || "").toUpperCase(),
            name: c.name,
            image: c.thumb,
          })),
        );
      } catch {
        // ignore
      }
    }, 350);

    return () => clearTimeout(t);
  }, [coinSearch]);

  /**
   * =========================================================
   * HEADER MOVERS (via /api/cg/*)
   * =========================================================
   */
  const fetchMovers = useCallback(async () => {
    const now = Date.now();
    if (now - GLOBAL_CACHE.movers.ts < TTL_MOVERS_MS) {
      setMovers(GLOBAL_CACHE.movers.data);
      return;
    }

    setMoversLoading(true);
    try {
      // Trending (top 5)
      const trendRes = await coingeckoFetch("/api/cg/trending");
      const trending = (await safeJson(trendRes)) ?? [];

      // enrich trending with markets data
      const trendingIds = Array.isArray(trending)
        ? trending.map((t) => t.id).join(",")
        : "";
      let trendingEnriched = Array.isArray(trending) ? trending : [];
      if (trendingIds) {
        const mRes = await coingeckoFetch(
          `/api/cg/markets?ids=${encodeURIComponent(trendingIds)}`,
        );
        const mJson = await safeJson(mRes);
        const mArr = Array.isArray(mJson) ? mJson : [];
        const byId = new Map(mArr.map((x) => [x.id, x]));
        trendingEnriched = trendingEnriched.map((t) => {
          const x = byId.get(t.id);
          return {
            ...t,
            price: x?.current_price ?? null,
            change24h: x?.price_change_percentage_24h ?? null,
            image: x?.image ?? t.image,
          };
        });
      }

      // Gainers / Losers
      const gainRes = await coingeckoFetch("/api/cg/movers?order=desc");
      const gainJson = await safeJson(gainRes);
      const gainArr = Array.isArray(gainJson) ? gainJson : [];
      const gainers = gainArr.slice(0, 5).map((x) => ({
        id: x.id,
        symbol: String(x.symbol || "").toUpperCase(),
        name: x.name,
        image: x.image,
        price: x.current_price,
        change24h: x.price_change_percentage_24h,
      }));

      const loseRes = await coingeckoFetch("/api/cg/movers?order=asc");
      const loseJson = await safeJson(loseRes);
      const loseArr = Array.isArray(loseJson) ? loseJson : [];
      const losers = loseArr.slice(0, 5).map((x) => ({
        id: x.id,
        symbol: String(x.symbol || "").toUpperCase(),
        name: x.name,
        image: x.image,
        price: x.current_price,
        change24h: x.price_change_percentage_24h,
      }));

      const data = { trending: trendingEnriched, gainers, losers };
      GLOBAL_CACHE.movers = { ts: now, data };
      setMovers(data);
    } catch {
      // non-fatal
    } finally {
      setMoversLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovers();
    const t = setInterval(fetchMovers, TTL_MOVERS_MS);
    return () => clearInterval(t);
  }, [fetchMovers]);

  /**
   * =========================================================
   * DATA ORCHESTRATION
   * =========================================================
   */
  useEffect(() => {
    setOpenDropdown(null);

    if (activeAsset.type === "LOCAL") {
      setLivePaused(false);
      setStatusText(null);
      setLoading(true);
      setChartLoading(true);
      computeLocalView(selectedTfKey);
      return;
    }

    hydrateGlobal(activeAsset.id);
  }, [
    activeAsset.id,
    activeAsset.type,
    computeLocalView,
    hydrateGlobal,
    selectedTfKey,
  ]);

  useEffect(() => {
    setChartLoading(true);

    if (activeAsset.type === "LOCAL") {
      computeLocalView(selectedTfKey);
      return;
    }

    const market = getCached(
      GLOBAL_CACHE.marketById,
      activeAsset.id,
      TTL_MARKET_MS,
    );
    const short = globalSeries.short ?? [];
    const long = globalSeries.long ?? [];
    computeGlobalCardsAndChart(selectedTfKey, short, long, market ?? null);
  }, [
    activeAsset.id,
    activeAsset.type,
    computeGlobalCardsAndChart,
    computeLocalView,
    globalSeries.long,
    globalSeries.short,
    selectedTfKey,
  ]);

  // Global refresh (no websocket exists for CoinGecko)
  useEffect(() => {
    if (activeAsset.type !== "GLOBAL") return;
    const t = setInterval(() => {
      hydrateGlobal(activeAsset.id);
    }, 60_000); // ✅ 45s -> 60s
    return () => clearInterval(t);
  }, [activeAsset.id, activeAsset.type, hydrateGlobal]);

  /**
   * =========================================================
   * CHART COLOR (based on visible range start vs end)
   * =========================================================
   */
  const selectedCard = cardsByTf[selectedTfKey] ?? {
    change: 0,
    sinceLabel: null,
  };
  const selectedTrend = getTrendStatus(selectedCard.change);

  const chartTrend = useMemo(() => {
    if (!chartData || chartData.length < 2) return selectedTrend;
    const start = chartData[0]?.val;
    const end = chartData[chartData.length - 1]?.val;
    return getTrendStatus(computePctChange(start, end));
  }, [chartData, selectedTrend]);

  const windowLabel = useMemo(() => {
    if (!chartData?.length) return null;
    const startTs = chartData[0]?.ts;
    const endTs = chartData[chartData.length - 1]?.ts;
    return formatRangeLabel(startTs, endTs, selectedTfKey);
  }, [chartData, selectedTfKey]);

  if (!mounted) return null;

  const activeId = activeAsset.id;
  const isLocal = activeAsset.type === "LOCAL";

  const headerBadge = livePaused
    ? {
        text: "Live Feed Paused - Retrying...",
        cls: "bg-amber-500/10 border-amber-500/40 text-amber-500",
        icon: AlertTriangle,
      }
    : {
        text: "System Live",
        cls: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
        icon: Wifi,
      };

  const HeroIcon = () => {
    if (isLocal) {
      return activeId === "VSTR" ? (
        <VstrLogo className="w-12 h-12 text-blue-500" />
      ) : (
        <OrtaLogo className="w-12 h-12 text-blue-500" />
      );
    }
    if (activeAsset.image) {
      return (
        <img
          src={activeAsset.image}
          alt={activeAsset.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-black text-2xl text-white uppercase">
        {(activeAsset.symbol || activeId)[0]}
      </div>
    );
  };

  const toggleDropdown = (key) =>
    setOpenDropdown((prev) => (prev === key ? null : key));

  const Dropdown = ({ type, items }) => {
    if (openDropdown !== type) return null;

    const empty = !items || !items.length;

    return (
      <div
        className={`absolute top-full left-0 mt-2 w-72 ${theme.cardSolid} border ${theme.border} rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl`}
      >
        {moversLoading && empty ? (
          <div className="p-3 space-y-2">
            <div className="h-3 w-40 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
            <div className="h-3 w-56 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
            <div className="h-3 w-48 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
          </div>
        ) : (
          items.map((c) => {
            const change = c.change24h ?? null;
            const s = getTrendStatus(change ?? 0);

            return (
              <button
                key={c.id}
                onClick={() => {
                  setOpenDropdown(null);
                  selectAsset(c.id, {
                    type: "GLOBAL",
                    symbol: String(c.symbol || "").toUpperCase(),
                    name: c.name,
                    image: c.image,
                  });
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left justify-between ${theme.hover}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border ${theme.border}`}
                    >
                      {String(c.symbol || c.id)[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">
                      {String(c.symbol || "").toUpperCase()}
                    </div>
                    <div className={`text-[10px] truncate ${theme.subtleText}`}>
                      {c.name}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-0.5">
                  {c.price !== null && c.price !== undefined ? (
                    <div
                      className={`text-[10px] font-mono ${theme.subtleText}`}
                    >
                      {formatCurrency(c.price)}
                    </div>
                  ) : (
                    <div className={`text-[10px] ${theme.subtleText}`}>
                      {type === "trending" ? `Rank #${c.rank ?? "-"}` : ""}
                    </div>
                  )}
                  {change !== null && change !== undefined ? (
                    <div className={`text-xs font-black ${s.color}`}>
                      {formatPercentSigned(change)}
                    </div>
                  ) : (
                    <div className="text-[10px] opacity-40"> </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    );
  };

  const pinnedGlobal =
    !isLocal &&
    !SIDEBAR_GLOBAL.some((c) => c.id === activeId) && {
      id: activeId,
      symbol: activeAsset.symbol,
      name: activeAsset.name,
      image: activeAsset.image,
    };

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text} flex overflow-x-hidden font-sans select-none`}
    >
      {/* SIDEBAR */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-full z-50 ${
          isSidebarOpen ? "w-72" : "w-20"
        } ${theme.sidebarBg} border-r ${
          theme.border
        } transition-all duration-300 flex-col backdrop-blur-xl`}
      >
        <div
          className={`h-24 flex items-center px-6 border-b ${theme.border} ${
            isSidebarOpen ? "justify-start gap-4" : "justify-center"
          }`}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-in fade-in">
              <span className="font-black text-xl tracking-tighter">
                COINMETER
              </span>
              <span className="text-[10px] text-blue-500 font-mono tracking-widest uppercase font-bold">
                PRO TERMINAL
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 py-8 px-4 space-y-8 overflow-y-auto no-scrollbar">
          {/* LOCAL */}
          <div>
            {isSidebarOpen && (
              <div
                className={`px-2 mb-3 text-[10px] font-bold uppercase tracking-widest ${theme.subtleText} flex items-center gap-2`}
              >
                <Zap size={12} /> Vestra Ecosystem
              </div>
            )}
            <div className="space-y-2">
              <button
                onClick={() => selectAsset("VSTR")}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent transition-all ${
                  activeId === "VSTR"
                    ? theme.activeItem
                    : `${theme.hover} opacity-70 hover:opacity-100`
                }`}
              >
                <VstrLogo className="w-6 h-6 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="text-sm font-bold">VSTR Token</span>
                )}
                {isSidebarOpen && activeId === "VSTR" && (
                  <ChevronRight size={14} className="ml-auto" />
                )}
              </button>

              <button
                onClick={() => selectAsset("ORTA")}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent transition-all ${
                  activeId === "ORTA"
                    ? theme.activeItem
                    : `${theme.hover} opacity-70 hover:opacity-100`
                }`}
              >
                <OrtaLogo className="w-6 h-6 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="text-sm font-bold">ORTA Chain</span>
                )}
                {isSidebarOpen && activeId === "ORTA" && (
                  <ChevronRight size={14} className="ml-auto" />
                )}
              </button>
            </div>
          </div>

          {/* GLOBAL */}
          <div>
            {isSidebarOpen && (
              <div
                className={`px-2 mb-3 text-[10px] font-bold uppercase tracking-widest ${theme.subtleText} flex items-center gap-2`}
              >
                <Globe size={12} /> Global Markets
              </div>
            )}

            {/* ✅ SEARCH */}
            {isSidebarOpen && (
              <div className="px-2 mb-3">
                <input
                  value={coinSearch}
                  onChange={(e) => setCoinSearch(e.target.value)}
                  placeholder="Search coin..."
                  className={`w-full px-3 py-2 rounded-xl text-sm outline-none border ${theme.border} ${
                    darkMode ? "bg-white/5" : "bg-slate-900/5"
                  }`}
                />
              </div>
            )}

            {isSidebarOpen && coinSearchResults.length > 0 && (
              <div className="space-y-2 mb-4">
                {coinSearchResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCoinSearch("");
                      setCoinSearchResults([]);
                      selectAsset(c.id, {
                        type: "GLOBAL",
                        symbol: c.symbol,
                        name: c.name,
                        image: c.image,
                      });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${theme.hover}`}
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate">
                        {c.symbol}
                      </div>
                      <div className={`text-[10px] truncate ${theme.subtleText}`}>
                        {c.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {pinnedGlobal ? (
                <button
                  onClick={() =>
                    selectAsset(pinnedGlobal.id, {
                      type: "GLOBAL",
                      symbol: pinnedGlobal.symbol,
                      name: pinnedGlobal.name,
                      image: pinnedGlobal.image,
                    })
                  }
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent transition-all ${theme.activeItem}`}
                >
                  {pinnedGlobal.image ? (
                    <img
                      src={pinnedGlobal.image}
                      alt={pinnedGlobal.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold border border-white/10">
                      {String(pinnedGlobal.symbol || pinnedGlobal.id)[0]}
                    </div>
                  )}
                  {isSidebarOpen && (
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-bold truncate">
                        {pinnedGlobal.symbol}
                      </span>
                      <span className="text-[10px] opacity-60 truncate">
                        Selected
                      </span>
                    </div>
                  )}
                  {isSidebarOpen && (
                    <ChevronRight size={14} className="ml-auto" />
                  )}
                </button>
              ) : null}

              {SIDEBAR_GLOBAL.map((coin) => {
                const img = sidebarImages[coin.id] ?? null;
                return (
                  <button
                    key={coin.id}
                    onClick={() =>
                      selectAsset(coin.id, { image: img ?? null })
                    }
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent transition-all ${
                      activeId === coin.id
                        ? theme.activeItem
                        : `${theme.hover} opacity-70 hover:opacity-100`
                    }`}
                  >
                    {/* ✅ real icon + same size */}
                    {img ? (
                      <img
                        src={img}
                        alt={coin.name}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${theme.border}`}
                      >
                        {coin.symbol[0]}
                      </div>
                    )}

                    {isSidebarOpen && (
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold">{coin.symbol}</span>
                        <span className={`text-[10px] ${theme.subtleText}`}>
                          {coin.name}
                        </span>
                      </div>
                    )}
                    {isSidebarOpen && activeId === coin.id && (
                      <ChevronRight size={14} className="ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main
        className={`flex-1 transition-all duration-300 relative ml-0 ${
          isSidebarOpen ? "md:ml-72" : "md:ml-20"
        }`}
      >
        {/* HEADER */}
        <header
          className={`h-20 border-b ${theme.border} ${theme.headerBg} flex items-center px-8 justify-between sticky top-0 z-40 backdrop-blur-xl`}
          ref={dropdownWrapRef}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg opacity-70 hover:opacity-100 transition-all ${theme.hover}`}
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Market scanner */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Trending */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("trending")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    darkMode
                      ? "bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10"
                      : "bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15"
                  }`}
                >
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-xs font-black text-orange-600 uppercase tracking-widest">
                    Trending
                  </span>
                  <ChevronDown
                    size={12}
                    className="text-orange-500 opacity-60"
                  />
                </button>
                <Dropdown type="trending" items={movers.trending} />
              </div>

              {/* Gainers */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("gainers")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    darkMode
                      ? "bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10"
                      : "bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15"
                  }`}
                >
                  <TrendingUp size={14} className="text-emerald-600" />
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                    Top Gainers
                  </span>
                  <ChevronDown
                    size={12}
                    className="text-emerald-600 opacity-60"
                  />
                </button>
                <Dropdown type="gainers" items={movers.gainers} />
              </div>

              {/* Losers */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("losers")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    darkMode
                      ? "bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10"
                      : "bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15"
                  }`}
                >
                  <TrendingDown size={14} className="text-rose-600" />
                  <span className="text-xs font-black text-rose-700 uppercase tracking-widest">
                    Top Losers
                  </span>
                  <ChevronDown size={12} className="text-rose-600 opacity-60" />
                </button>
                <Dropdown type="losers" items={movers.losers} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${headerBadge.cls}`}
            >
              <headerBadge.icon size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {headerBadge.text}
              </span>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg opacity-70 hover:opacity-100 transition-all ${theme.hover}`}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-[1800px] mx-auto space-y-8">
          {/* HERO + CHART */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT */}
            <div className="lg:w-1/3 flex flex-col justify-center animate-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3 mb-4">
                <HeroIcon />
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    {activeAsset.symbol}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        theme.border
                      } ${darkMode ? "bg-white/5" : "bg-slate-900/5"}`}
                    >
                      {activeAsset.type} MARKET
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      {selectedTfKey}
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 ${theme.subtleText}`}>
                    {activeAsset.name}
                  </div>
                </div>
              </div>

              <div
                className={`mt-2 p-6 rounded-3xl relative overflow-hidden group ${
                  darkMode
                    ? "bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5"
                    : "bg-gradient-to-br from-slate-900/[0.02] to-transparent border border-slate-200/80"
                }`}
              >
                <div
                  className={`absolute top-0 right-0 p-24 bg-gradient-to-br ${selectedTrend.bg} blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity`}
                />
                <div className="relative z-10">
                  <div
                    className={`text-xs font-black uppercase tracking-widest mb-1 ${theme.subtleText}`}
                  >
                    Current Price
                  </div>

                  <div className="text-5xl md:text-6xl font-mono font-black tracking-tighter mb-2">
                    {loading ? (
                      <div className="h-14 w-40 bg-black/10 dark:bg-white/10 rounded animate-pulse" />
                    ) : (
                      formatCurrency(currentPrice)
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-3 text-2xl font-black ${selectedTrend.color}`}
                  >
                    <div
                      className={`p-1 rounded-full ${selectedTrend.bg} ${selectedTrend.border} border`}
                    >
                      <selectedTrend.icon size={24} />
                    </div>
                    {formatPercentSigned(selectedCard.change)}
                  </div>

                  {sinceLabel ? (
                    <div className="mt-2 text-[10px] text-blue-500/80 font-bold uppercase tracking-widest">
                      {sinceLabel}
                    </div>
                  ) : null}

                  {statusText ? (
                    <div className="mt-2 text-[10px] text-amber-500/80 font-bold uppercase tracking-widest">
                      {statusText}
                    </div>
                  ) : null}

                  {/* PRO META */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {activeAsset.type === "GLOBAL" ? (
                      <>
                        <div
                          className={`p-3 rounded-2xl border ${theme.border} ${
                            darkMode ? "bg-white/5" : "bg-slate-900/5"
                          }`}
                        >
                          <div
                            className={`text-[10px] font-black uppercase tracking-widest ${theme.subtleText}`}
                          >
                            Market Cap
                          </div>
                          <div className="text-sm font-black mt-1">
                            {formatUsdCompact(marketMeta?.marketCap)}
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-2xl border ${theme.border} ${
                            darkMode ? "bg-white/5" : "bg-slate-900/5"
                          }`}
                        >
                          <div
                            className={`text-[10px] font-black uppercase tracking-widest ${theme.subtleText}`}
                          >
                            24H Volume
                          </div>
                          <div className="text-sm font-black mt-1">
                            {formatUsdCompact(marketMeta?.volume24h)}
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-2xl border ${theme.border} ${
                            darkMode ? "bg-white/5" : "bg-slate-900/5"
                          }`}
                        >
                          <div
                            className={`text-[10px] font-black uppercase tracking-widest ${theme.subtleText}`}
                          >
                            24H High
                          </div>
                          <div className="text-sm font-black mt-1">
                            {formatCurrency(marketMeta?.high24h)}
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-2xl border ${theme.border} ${
                            darkMode ? "bg-white/5" : "bg-slate-900/5"
                          }`}
                        >
                          <div
                            className={`text-[10px] font-black uppercase tracking-widest ${theme.subtleText}`}
                          >
                            24H Low
                          </div>
                          <div className="text-sm font-black mt-1">
                            {formatCurrency(marketMeta?.low24h)}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className={`p-3 rounded-2xl border ${theme.border} ${
                            darkMode ? "bg-white/5" : "bg-slate-900/5"
                          }`}
                        >
                          <div
                            className={`text-[10px] font-black uppercase tracking-widest ${theme.subtleText}`}
                          >
                            24H High
                          </div>
                          <div className="text-sm font-black mt-1">
                            {formatCurrency(marketMeta?.high24h)}
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-2xl border ${theme.border} ${
                            darkMode ? "bg-white/5" : "bg-slate-900/5"
                          }`}
                        >
                          <div
                            className={`text-[10px] font-black uppercase tracking-widest ${theme.subtleText}`}
                          >
                            24H Low
                          </div>
                          <div className="text-sm font-black mt-1">
                            {formatCurrency(marketMeta?.low24h)}
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-2xl border ${theme.border} ${
                            darkMode ? "bg-white/5" : "bg-slate-900/5"
                          } col-span-2`}
                        >
                          <div
                            className={`text-[10px] font-black uppercase tracking-widest ${theme.subtleText}`}
                          >
                            Last Update
                          </div>
                          <div className="text-sm font-black mt-1">
                            {marketMeta?.lastUpdatedTs
                              ? new Date(
                                  marketMeta.lastUpdatedTs,
                                ).toLocaleString("en-US")
                              : "---"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                      <Zap size={12} /> Analysis
                    </div>
                    <p className="text-sm italic opacity-70 leading-relaxed">
                      “{analysisText ?? "Market analysis active..."}”
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT (CHART) */}
            <div
              className={`lg:w-2/3 ${theme.cardBg} border ${theme.border} rounded-3xl p-6 relative min-h-[450px] flex flex-col shadow-2xl backdrop-blur-xl`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 opacity-70">
                  <LineChart size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Price History
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {chartLoading ? (
                    <RefreshCcw
                      className="animate-spin text-blue-500"
                      size={18}
                    />
                  ) : (
                    <div className="flex gap-1">
                      {TIMEFRAMES.map((t) => (
                        <div
                          key={t.key}
                          className={`w-1 h-1 rounded-full transition-all ${
                            selectedTfKey === t.key
                              ? "bg-blue-500 w-4"
                              : darkMode
                              ? "bg-white/10"
                              : "bg-slate-900/10"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {windowLabel ? (
                <div
                  className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${theme.subtleText}`}
                >
                  Window: {windowLabel}
                </div>
              ) : (
                <div className="mb-4" />
              )}

              {loading || chartLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <RefreshCcw
                    className="animate-spin text-blue-500"
                    size={40}
                  />
                </div>
              ) : chartData.length > 1 ? (
                <div className="flex-1 w-full animate-in fade-in duration-500">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="chartGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={chartTrend.hex}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={chartTrend.hex}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={darkMode ? "#ffffff08" : "#00000010"}
                        vertical={false}
                      />
                      <XAxis dataKey="ts" hide />
                      <YAxis domain={["auto", "auto"]} hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? "#09090b" : "#ffffff",
                          border: darkMode
                            ? "1px solid #27272a"
                            : "1px solid #e5e7eb",
                          borderRadius: "12px",
                          color: darkMode ? "#fff" : "#111827",
                        }}
                        labelFormatter={(t) =>
                          smartTickFormatter(t, selectedTfKey)
                        }
                        formatter={(v) => [formatCurrency(v), "Price"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="val"
                        stroke={chartTrend.hex}
                        strokeWidth={3}
                        fill="url(#chartGrad)"
                        animationDuration={500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                  <Minus size={40} />
                  <span className="text-xs uppercase font-black tracking-widest mt-2">
                    No data for this range
                  </span>
                  {sinceLabel ? (
                    <span className="text-[10px] text-blue-500/80 font-bold uppercase tracking-widest mt-1">
                      {sinceLabel}
                    </span>
                  ) : null}
                </div>
              )}

              {/* ✅ (5'i) Load older history */}
              {activeAsset.type === "LOCAL" && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={fetchLocalOlder}
                    disabled={localOlderLoading}
                    className={`px-4 py-2 rounded-xl border ${theme.border} ${
                      darkMode ? "bg-white/5" : "bg-slate-900/5"
                    } ${theme.hover} text-xs font-black uppercase tracking-widest`}
                  >
                    {localOlderLoading ? "Loading..." : "Load more history"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TIMEFRAME CARDS */}
          <div>
            <div className="flex items-center gap-2 mb-6 opacity-70 px-2">
              <LayoutDashboard size={18} />
              <span className="text-xs font-black uppercase tracking-widest">
                Select Timeframe
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {TIMEFRAMES.map((tf) => {
                const card = cardsByTf[tf.key] ?? {
                  change: 0,
                  sinceLabel: null,
                };
                const isActive = selectedTfKey === tf.key;
                const s = getTrendStatus(card.change);

                return (
                  <button
                    key={tf.key}
                    onClick={() => setSelectedTfKey(tf.key)}
                    className={`${theme.cardBg} border ${
                      isActive
                        ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                        : `${theme.border} hover:border-black/10 dark:hover:border-white/20`
                    } rounded-xl p-4 transition-all group relative overflow-hidden text-left w-full backdrop-blur-xl`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          isActive
                            ? "text-blue-600"
                            : darkMode
                            ? "text-slate-500"
                            : "text-slate-500"
                        }`}
                      >
                        {tf.label}
                      </span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>

                    <div
                      className={`text-lg font-black tracking-tighter ${s.color}`}
                    >
                      {formatPercentSigned(card.change)}
                    </div>

                    {card.sinceLabel ? (
                      <div className="mt-1 text-[9px] opacity-60 font-bold uppercase tracking-widest">
                        {card.sinceLabel}
                      </div>
                    ) : (
                      <div className="mt-1 text-[9px] opacity-20 font-bold uppercase tracking-widest">
                        {" "}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
