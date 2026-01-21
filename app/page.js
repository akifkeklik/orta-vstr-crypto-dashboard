"use client";

import { createClient } from "@supabase/supabase-js";
import {
  Activity,
  AlertCircle,
  Clock,
  Layers,
  Minus,
  Moon,
  RefreshCcw,
  Search,
  Server,
  Sun,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// --- LOGOLAR ---
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

// --- DÜZELTİLMİŞ MANTIK ---
const getTrendStatus = (v) => {
  const n = parseFloat(v); // String gelirse sayıya çevir

  // Eğer sayı değilse veya 0 ise nötr döndür
  if (isNaN(n) || n === 0)
    return {
      color: "text-amber-400",
      hex: "#fbbf24",
      sign: "",
      icon: Minus,
      bg: "bg-amber-400",
    };

  // Pozitif Durum
  if (n > 0)
    return {
      color: "text-emerald-500",
      hex: "#10b981",
      sign: "+",
      icon: TrendingUp,
      bg: "bg-emerald-500",
    };

  // Negatif Durum (Buraya 'sign: -' ekledik ki formatPercent eksiği sildiğinde biz geri koyalım)
  return {
    color: "text-rose-500",
    hex: "#f43f5e",
    sign: "-",
    icon: TrendingDown,
    bg: "bg-rose-500",
  };
};

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
  }).format(v);

// Mutlak değer alıyoruz ama getTrendStatus artık işareti yönetiyor
const formatPercent = (v) => Math.abs(Number(v)).toFixed(2) + "%";

const getPeriodMs = (label) => {
  const l = label?.toLowerCase() || "";
  if (l.includes("1 saat")) return 3600000;
  if (l.includes("24 saat")) return 86400000;
  if (l.includes("7 gün")) return 604800000;
  if (l.includes("30 gün")) return 2592000000;
  return 31536000000;
};

const smartTickFormatter = (ts, periodLabel) => {
  const date = new Date(ts);
  const label = periodLabel?.toLowerCase() || "";
  if (label.includes("1 saat") || label.includes("24 saat"))
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};

// SABİT 6 KART KURALI
const FIXED_INTERVALS = [
  "1 Saat",
  "24 Saat",
  "7 Gün",
  "30 Gün",
  "6 Ay",
  "1 Yıl",
];

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartHistory, setChartHistory] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("VSTR");
  const [darkMode, setDarkMode] = useState(true);
  const [latency, setLatency] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = useMemo(
    () => ({
      bg: darkMode ? "bg-[#050505]" : "bg-[#F3F4F6]",
      text: darkMode ? "text-white" : "text-[#111827]",
      textMuted: darkMode ? "text-slate-500" : "text-slate-400",
      sidebarBg: darkMode ? "bg-[#0a0a0a]" : "bg-white",
      cardBg: darkMode ? "bg-[#0a0a0a]" : "bg-white",
      border: darkMode ? "border-white/5" : "border-slate-200",
      inputBg: darkMode ? "bg-white/5" : "bg-slate-100",
      modalBg: darkMode ? "bg-[#050505]/95" : "bg-white/95",
    }),
    [darkMode],
  );

  const fetchData = async () => {
    const { data: raw } = await supabase
      .from("kripto_analiz")
      .select("*")
      .order("id", { ascending: false });

    if (raw) {
      const normalizedData = raw.map((item) => {
        let cleanName = (item.coin_adi || "").toUpperCase();
        // Veritabanında "Orta Chain" yazsa bile biz onu "ORTA" yapacağız
        if (cleanName.includes("ORTA")) cleanName = "ORTA";
        // Veritabanında "Vestra DAO" yazsa bile biz onu "VSTR" yapacağız
        if (cleanName.includes("VESTRA") || cleanName.includes("VSTR"))
          cleanName = "VSTR";

        return {
          ...item,
          coin_adi: cleanName,
        };
      }); 

      const uniqueMap = new Map();
      normalizedData.forEach((item) => {
        const key = `${item.coin_adi}-${item.zaman_araligii}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      setData(Array.from(uniqueMap.values()));
    }
  };

  useEffect(() => {
    fetchData();
    const i1 = setInterval(fetchData, 5000);
    const i2 = setInterval(async () => {
      const s = Date.now();
      await supabase.from("kripto_analiz").select("id").limit(1);
      setLatency(Date.now() - s);
    }, 5000);
    return () => {
      clearInterval(i1);
      clearInterval(i2);
    };
  }, []);

  useEffect(() => {
    if (!selectedCoin) return;
    const loadHist = async () => {
      setChartHistory([]);
      setChartLoading(true);
      const startTime = new Date(
        Date.now() - getPeriodMs(selectedCoin.zaman_araligii),
      ).toISOString();

      const { data: hist } = await supabase
        .from("kripto_analiz")
        .select("created_at, fiyat, coin_adi")
        .gte("created_at", startTime)
        .order("created_at", { ascending: true }); // Veritabanı sıralaması

      if (hist) {
        const filteredHist = hist
          .filter(
            (h) =>
              (h.coin_adi || "ORTA").toUpperCase() === selectedCoin.coin_adi,
          )
          // İstemci tarafında garanti sıralama (Grafik hatasını önler)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        if (filteredHist.length > 0) {
          const chartData = filteredHist.map((h) => ({
            ts: new Date(h.created_at).getTime(),
            val: Number(h.fiyat),
          }));
          setChartHistory(chartData);
        }
      }
      setChartLoading(false);
    };
    loadHist();
  }, [selectedCoin]);

  const headerTicker =
    data.find(
      (i) => i.coin_adi === activeTab && i.zaman_araligii === "24 Saat",
    ) || data.find((i) => i.coin_adi === activeTab);

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text} flex overflow-x-hidden font-sans`}
    >
      {/* --- SIDEBAR (PC İÇİN) --- */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={`hidden md:flex fixed top-0 left-0 h-full z-50 ${
          isSidebarOpen ? "w-64" : "w-20"
        } ${theme.sidebarBg} border-r ${
          theme.border
        } transition-all duration-300 flex-col shadow-2xl`}
      >
        <div
          className={`h-24 flex items-center px-6 border-b ${theme.border} ${
            isSidebarOpen ? "justify-between" : "justify-center"
          }`}
        >
          {isSidebarOpen ? (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight uppercase">
                VSTR ECOSYSTEM
              </span>
              <span className="text-[9px] text-emerald-500 font-mono tracking-widest uppercase opacity-60">
                Control Panel
              </span>
            </div>
          ) : (
            <VstrLogo className="w-8 h-8 text-emerald-500" />
          )}
        </div>
        <nav className="flex-1 py-8 px-3 space-y-2">
          <div
            onClick={() => setActiveTab("VSTR")}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group transition-all ${
              activeTab === "VSTR"
                ? "bg-emerald-500/10 text-emerald-500"
                : "opacity-50 hover:opacity-100"
            }`}
          >
            <VstrLogo className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && (
              <span className="text-sm font-semibold uppercase tracking-tighter">
                VSTR
              </span>
            )}
          </div>
          <div
            onClick={() => setActiveTab("ORTA")}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group transition-all ${
              activeTab === "ORTA"
                ? "bg-emerald-500/10 text-emerald-500"
                : "opacity-50 hover:opacity-100"
            }`}
          >
            <OrtaLogo className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && (
              <span className="text-sm font-semibold uppercase tracking-tighter">
                ORTA
              </span>
            )}
          </div>
        </nav>
        <div className="p-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              theme.inputBg
            } w-full ${!isSidebarOpen && "justify-center"}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isSidebarOpen && (
              <span className="text-xs font-bold uppercase tracking-wider">
                MOD
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* --- ANA İÇERİK --- */}
      <main
        className={`flex-1 transition-all duration-300 relative ml-0 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        {/* --- HEADER --- */}
        <header
          className={`h-20 md:h-24 border-b ${theme.border} sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between backdrop-blur-xl ${theme.sidebarBg}/80`}
        >
          {/* PC Arama */}
          <div
            className={`hidden md:flex items-center gap-3 ${theme.inputBg} px-4 py-2 rounded-xl border ${theme.border} w-[320px]`}
          >
            <Search size={16} className={theme.textMuted} />
            <input
              type="text"
              placeholder="Search metrics..."
              className="bg-transparent border-none outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* MOBİL LOGO */}
          <div className="md:hidden flex items-center gap-2">
            <VstrLogo className="w-6 h-6 text-emerald-500" />
            <span className="font-bold text-lg tracking-tight">VESTRA</span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Ticker Kısmı */}
            {headerTicker ? (
              <div className="flex items-center gap-4 px-3 py-2 md:px-5 md:py-2.5 rounded-full border border-white/5 bg-emerald-500/[0.03] shadow-sm animate-in fade-in">
                <div className="hidden md:flex items-center gap-2 border-r pr-4 border-white/5 opacity-60">
                  {activeTab === "VSTR" ? (
                    <VstrLogo className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <OrtaLogo className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {activeTab} LIVE
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs md:text-sm font-black font-mono leading-none tracking-tighter">
                    {formatCurrency(headerTicker.fiyat)}
                  </span>
                  <span
                    className={`text-[9px] font-bold ${
                      getTrendStatus(headerTicker.degisim_yuzdesi).color
                    }`}
                  >
                    {getTrendStatus(headerTicker.degisim_yuzdesi).sign}
                    {formatPercent(headerTicker.degisim_yuzdesi)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 px-5 py-2.5 rounded-full border border-white/5 bg-white/[0.03] opacity-50">
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
              </div>
            )}

            {/* PC Latency */}
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${theme.border} ${theme.inputBg}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  latency < 300
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              ></div>
              <span className="text-[10px] font-mono font-bold">
                {latency}ms
              </span>
              <Server size={14} className={theme.textMuted} />
            </div>
          </div>
        </header>

        {/* --- MOBİL TAB MENÜ --- */}
        <div className="md:hidden grid grid-cols-2 gap-2 px-4 py-4 border-b border-white/5 bg-black/20">
          <button
            onClick={() => setActiveTab("VSTR")}
            className={`py-2 rounded-lg text-xs font-bold border transition-all ${
              activeTab === "VSTR"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                : "bg-white/5 border-transparent opacity-50"
            }`}
          >
            VSTR ANALYTICS
          </button>
          <button
            onClick={() => setActiveTab("ORTA")}
            className={`py-2 rounded-lg text-xs font-bold border transition-all ${
              activeTab === "ORTA"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                : "bg-white/5 border-transparent opacity-50"
            }`}
          >
            ORTA ANALYTICS
          </button>
        </div>

        {/* --- İÇERİK ALANI --- */}
        <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
          <div className="mb-6 md:mb-10 animate-in slide-in-from-left-4 duration-500">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase mb-2">
              {activeTab} ANALYTICS
            </h1>
            <p
              className={`${theme.textMuted} text-xs md:text-sm font-medium uppercase tracking-tighter`}
            >
              Real-time system pulse from Vestra ecosystem.
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {FIXED_INTERVALS.map((interval) => {
              const item = data.find(
                (d) =>
                  d.coin_adi === activeTab && d.zaman_araligii === interval,
              );

              if (item) {
                const s = getTrendStatus(item.degisim_yuzdesi);
                return (
                  <div
                    key={interval}
                    onClick={() => setSelectedCoin(item)}
                    className={`group ${theme.cardBg} border ${theme.border} rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden`}
                  >
                    <div className="flex justify-between items-start mb-6 md:mb-10">
                      <div
                        className={`${theme.inputBg} px-4 py-1.5 rounded-lg border ${theme.border}`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {interval}
                        </span>
                      </div>
                      <div
                        className={`p-2 ${theme.inputBg} rounded-lg group-hover:bg-emerald-500 group-hover:text-black transition-all`}
                      >
                        <s.icon size={20} />
                      </div>
                    </div>
                    <div className="mb-6 md:mb-8">
                      <div
                        className={`text-5xl md:text-6xl font-mono font-black tracking-tighter ${s.color}`}
                      >
                        {s.sign}
                        {formatPercent(item.degisim_yuzdesi)}
                      </div>
                    </div>
                    <div
                      className={`border-t ${theme.border} pt-4 md:pt-6 flex items-center gap-4`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${s.bg} shadow-[0_0_10px_currentColor]`}
                      />
                      <p className="text-xs md:text-sm italic opacity-60 line-clamp-1 flex-1">
                        "{item.ai_yorumu}"
                      </p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={interval}
                    className={`group ${theme.cardBg} border ${theme.border} rounded-3xl p-6 md:p-8 opacity-30 cursor-not-allowed relative overflow-hidden`}
                  >
                    <div className="flex justify-between items-start mb-6 md:mb-10">
                      <div
                        className={`${theme.inputBg} px-4 py-1.5 rounded-lg border ${theme.border}`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {interval}
                        </span>
                      </div>
                      <div className={`p-2 ${theme.inputBg} rounded-lg`}>
                        <Activity size={20} />
                      </div>
                    </div>
                    <div className="mb-6 md:mb-8 flex flex-col gap-2">
                      <div className="text-4xl font-mono font-black tracking-tighter opacity-20">
                        --.--%
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 flex items-center gap-2">
                        <AlertCircle size={12} /> Syncing...
                      </span>
                    </div>
                    <div
                      className={`border-t ${theme.border} pt-4 md:pt-6 flex items-center gap-4`}
                    >
                      <div className="w-3 h-3 rounded-full bg-slate-500/20" />
                      <p className="text-xs md:text-sm italic opacity-30">
                        Waiting for data stream...
                      </p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </main>

      {/* --- MODAL (POPUP) --- */}
      {selectedCoin && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center ${theme.modalBg} backdrop-blur-md p-4 animate-in fade-in duration-300`}
        >
          <div
            className="absolute inset-0"
            onClick={() => setSelectedCoin(null)}
          ></div>
          <div
            className={`${darkMode ? "bg-[#080808]" : "bg-white"} border ${
              theme.border
            } w-full max-w-6xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col lg:flex-row max-h-[85vh] md:max-h-[90vh] overflow-y-auto`}
          >
            <button
              onClick={() => setSelectedCoin(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/5 hover:text-rose-500 transition-all z-20"
            >
              <X size={24} />
            </button>
            <div className="p-6 md:p-10 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6 md:mb-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl border border-emerald-500/20 flex items-center justify-center bg-emerald-500/5">
                    {selectedCoin.coin_adi === "VSTR" ? (
                      <VstrLogo className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
                    ) : (
                      <OrtaLogo className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase leading-none">
                      {selectedCoin.coin_adi}
                    </h2>
                    <div className="text-[10px] font-mono uppercase tracking-widest opacity-40 mt-2">
                      {selectedCoin.zaman_araligii} DATA
                    </div>
                  </div>
                </div>
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest opacity-30 mb-2 font-mono">
                      SPOT VALUATION
                    </div>
                    <div className="text-3xl md:text-4xl font-mono font-black tracking-tighter leading-none">
                      {formatCurrency(selectedCoin.fiyat)}
                    </div>
                  </div>
                  <div
                    className={`p-4 md:p-6 rounded-2xl border ${getTrendStatus(
                      selectedCoin.degisim_yuzdesi,
                    ).color.replace("text", "border")}/20 bg-white/[0.02]`}
                  >
                    <div
                      className={`text-3xl md:text-4xl font-black tracking-tighter ${
                        getTrendStatus(selectedCoin.degisim_yuzdesi).color
                      }`}
                    >
                      {getTrendStatus(selectedCoin.degisim_yuzdesi).sign}
                      {formatPercent(selectedCoin.degisim_yuzdesi)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-10 bg-white/[0.02] p-4 md:p-6 rounded-2xl border border-white/5 shadow-xl shadow-black/20">
                <div className="flex items-center gap-3 mb-4">
                  <Activity size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
                    AI Analysis
                  </span>
                </div>
                <p className="text-xs md:text-sm italic opacity-70 leading-relaxed font-medium">
                  "{selectedCoin.ai_yorumu}"
                </p>
              </div>
            </div>

            <div
              className={`p-6 md:p-10 lg:w-2/3 ${
                darkMode ? "bg-[#050505]" : "bg-slate-50"
              } flex flex-col h-[400px] lg:h-auto`}
            >
              <div className="flex justify-between items-center mb-4 md:mb-8">
                <h3 className="text-xs md:text-sm font-black opacity-30 flex items-center gap-2 uppercase tracking-widest font-mono">
                  <Clock size={16} /> LINEAR HORIZON
                </h3>
                <div className="text-[9px] px-4 py-2 rounded-full border border-white/10 font-bold opacity-40 uppercase font-mono tracking-widest bg-white/5">
                  High-Precision Build
                </div>
              </div>
              <div className="flex-1 min-h-[250px]">
                {chartLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <RefreshCcw
                      className="animate-spin text-emerald-500"
                      size={32}
                    />
                  </div>
                ) : chartHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartHistory}>
                      <defs>
                        <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={
                              getTrendStatus(selectedCoin.degisim_yuzdesi).hex
                            }
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor={
                              getTrendStatus(selectedCoin.degisim_yuzdesi).hex
                            }
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={darkMode ? "#ffffff05" : "#00000010"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="ts"
                        type="number"
                        domain={[
                          Date.now() - getPeriodMs(selectedCoin.zaman_araligii),
                          Date.now(),
                        ]}
                        tickFormatter={(t) =>
                          smartTickFormatter(t, selectedCoin.zaman_araligii)
                        }
                        fontSize={10}
                        stroke="#525252"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={([dataMin, dataMax]) => {
                          const diff = dataMax - dataMin;
                          const margin =
                            diff === 0 ? dataMin * 0.1 : diff * 0.4;
                          return [dataMin - margin, dataMax + margin];
                        }}
                        hide
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000",
                          border: "1px solid #222",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                        labelFormatter={(t) =>
                          new Date(t).toLocaleString("tr-TR")
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="val"
                        stroke={
                          getTrendStatus(selectedCoin.degisim_yuzdesi).hex
                        }
                        strokeWidth={3}
                        fill="url(#c)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4">
                    <Layers size={60} />
                    <p className="font-mono text-xs font-black uppercase tracking-widest">
                      Syncing...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
