"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Greeting from "@/components/greetings";
import LocalDate from "@/components/localDate";
import { formatRupiah } from "@/utils/formatter";
import Image from "next/image";

const DONUT_COLORS = ["#606C38", "#DDA15E", "#283618", "#BC6C25", "#70E000"];

interface AIInsightData {
  harvestProjection: {
    percent: number;
    summary: string;
    estimates: Array<{ type: string; kg: number }>;
  };
  profitEstimate: {
    percent: number;
    summary: string;
  };
  recommendations: string[];
}

export default function FarmerDashboardRoot() {
  const [stats, setStats] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ai insight states with lazy initializer from sessionStorage
  const [aiInsight, setAiInsight] = useState<AIInsightData | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = sessionStorage.getItem("ai_insight_cache");
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < 10 * 60 * 1000 && data) {
          return data;
        }
      }
    } catch {
      // silent fail
    }
    return null;
  });

  const [aiLoading, setAiLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const cached = sessionStorage.getItem("ai_insight_cache");
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < 10 * 60 * 1000 && data) {
          return false;
        }
      }
    } catch {
      // silent fail
    }
    return true;
  });

  const [aiError, setAiError] = useState<string | null>(null);

  // fetch data statistik & profil petani
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsRes, profileRes] = await Promise.all([
          fetch("/api/app/statistik"),
          fetch("/api/app/profil"),
        ]);

        if (!statsRes.ok) throw new Error("Gagal memuat data statistik");

        const statsData = await statsRes.json();
        if (!ignore) setStats(statsData);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (!ignore) setUserProfile(profileData);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Error loading stats");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  // manual refresh or refetch ai insight
  const fetchAIInsight = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem("ai_insight_cache");
        if (cached) {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < 10 * 60 * 1000 && data) {
            setAiInsight(data);
            setAiLoading(false);
            return;
          }
        }
      } catch {
        // silent storage parse error
      }
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/app/ai-insight");
      const json = await res.json();

      if (res.ok && json.data) {
        setAiInsight(json.data);
        sessionStorage.setItem(
          "ai_insight_cache",
          JSON.stringify({ timestamp: Date.now(), data: json.data }),
        );
      } else if (json.reason === "not_configured") {
        setAiError("not_configured");
      } else {
        setAiError("api_error");
      }
    } catch {
      setAiError("network_error");
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (aiInsight) return;

    let ignore = false;
    fetch("/api/app/ai-insight")
      .then((res) => res.json())
      .then((json) => {
        if (ignore) return;
        if (json.data) {
          setAiInsight(json.data);
          sessionStorage.setItem(
            "ai_insight_cache",
            JSON.stringify({ timestamp: Date.now(), data: json.data }),
          );
        } else if (json.reason === "not_configured") {
          setAiError("not_configured");
        } else {
          setAiError("api_error");
        }
      })
      .catch(() => {
        if (!ignore) setAiError("network_error");
      })
      .finally(() => {
        if (!ignore) setAiLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [aiInsight]);

  const farmerStats = useMemo(() => {
    if (!stats) return [];
    return [
      {
        text: "Luas Lahan",
        stat: `${stats.kpi.totalLuasHa} Ha`,
        subtitle: `${stats.kpi.totalLahan} Plot Kebun Aktif`,
        iconSrc: "/icon/cocoSeed.png",
        link: "/app/lahan",
      },
      {
        text: "Pohon Kelapa",
        stat: `${stats.kpi.totalPohon} pohon`,
        subtitle: "Varietas Dalam & Genjah",
        iconSrc: "/icon/cocoPlant.png",
        link: "/app/lahan",
      },
      {
        text: "Hasil Panen",
        stat: `${(stats.kpi.totalHasilPanen / 1000).toFixed(1)} Ton`,
        subtitle: "Total tercatat",
        iconSrc: "/icon/coconut.png",
        link: "/app/produksi",
      },
      {
        text: "Total Pendapatan",
        stat: formatRupiah(stats.kpi.totalPendapatan),
        subtitle: "Total tercatat",
        iconSrc: "/icon/money.png",
        link: "/app/produksi",
      },
    ];
  }, [stats]);

  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      value,
    } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 12}
          fill={fill}
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill="#111827"
          className="text-xs font-bold font-['Quicksand']"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fill="#606C38"
          className="text-sm font-extrabold font-['Quicksand']"
        >
          {formatRupiah(value)}
        </text>
      </g>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#606C38]" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center text-red-500 p-8 font-['Quicksand',sans-serif]">
        Error: {error || "Data tidak ditemukan."}. Coba refresh halaman.
      </div>
    );
  }

  const kopdesLabel =
    userProfile?.isVerified && userProfile?.kopdes?.name
      ? `${userProfile.kopdes.name}`
      : "Akun belum terverifikasi";

  return (
    <div
      data-tour="Greeting"
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]"
    >
      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Greeting />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            <LocalDate /> • {kopdesLabel}
          </p>
        </div>
      </div>

      {/* --- 4 MAIN STATISTIC CARDS --- */}
      <div
        data-tour="statistik singkat"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full"
      >
        {farmerStats.map((data, index) => (
          <Card
            key={index}
            className="bg-white border border-gray-200 rounded-2xl shadow-none hover:border-gray-300 transition-colors"
          >
            <CardContent className="px-4 sm:px-5 flex items-center gap-4">
              <div className="w-16 h-16 shrink-0 border border-gray-200 bg-gray-50/50 rounded-2xl flex items-center justify-center">
                <Image
                  src={data.iconSrc}
                  alt={data.text}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                  {data.text}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                  {data.stat}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- CHART LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Profit Analytics Bar Chart */}
        <Card
          data-tour="Profit"
          className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-none"
        >
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-bold text-gray-900">
              Analisis Profitabilitas 6 Bulan Terakhir
            </CardTitle>
            <p className="text-xs font-medium text-gray-500">
              Total pendapatan dikurangi pengeluaran manual.
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={stats.charts.profitChartData}
                  margin={{ top: 10, right: 0, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={(val) => formatRupiah(val)}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(96,108,56,0.05)" }}
                    formatter={(value) => formatRupiah(value)}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
                  />
                  <Bar
                    dataKey="income"
                    name="Pemasukan"
                    stackId="a"
                    fill="#606C38"
                    radius={[4, 4, 0, 0]}
                    stroke="none"
                  />
                  <Bar
                    dataKey="expense"
                    name="Pengeluaran"
                    stackId="a"
                    fill="#BC6C25"
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Laba (Profit)"
                    stroke="#283618"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#283618" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs font-bold">
              <span className="text-gray-700">
                Total Laba Bersih (6 Bulan Terakhir)
              </span>
              <span className="text-[#606C38] font-extrabold text-sm">
                {formatRupiah(
                  stats.kpi.totalPendapatan - stats.kpi.totalPengeluaran,
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Component Donut Chart */}
        <Card
          data-tour="Komposisi"
          className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl shadow-none"
        >
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-bold text-gray-900">
              Komposisi Penjualan
            </CardTitle>
            <p className="text-xs font-medium text-gray-500">
              Berdasarkan nilai penjualan panen.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-between min-h-[340px]">
            <div className="h-[260px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      paddingTop: "12px",
                      lineHeight: "28px",
                    }}
                  />
                  <Pie
                    data={stats.charts.donutChartData}
                    stroke="none"
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    activeShape={renderActiveShape}
                  >
                    {stats.charts.donutChartData.map(
                      (entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- AI INSIGHT --- */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
        <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#606C38]/10 text-[#606C38] flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-bold text-gray-900">
              Rekomendasi AI Agronomic Insight
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchAIInsight(true)}
              disabled={aiLoading}
              className="h-8 px-2.5 text-xs text-[#606C38] hover:bg-[#606C38]/10 font-bold rounded-lg"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1 ${aiLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {aiLoading ? (
            /* render skeleton shimmer saat loading gemini */
            <div className="space-y-4 animate-pulse">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="flex gap-2 pt-1">
                  <div className="h-6 bg-gray-200 rounded-md w-24"></div>
                  <div className="h-6 bg-gray-200 rounded-md w-24"></div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                <div className="space-y-1 w-2/3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ) : aiError || !aiInsight ? (
            /* error/fallback state */
            <div className="p-5 text-center border border-dashed border-gray-200 rounded-xl space-y-3 bg-gray-50/50">
              <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900">
                  AI Insight Belum Aktif / Perlu Konfigurasi
                </h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {aiError === "not_configured"
                    ? "API Key Gemini belum terpasang pada env server. Fitur kecerdasan buatan siap diaktifkan."
                    : "Tidak dapat terhubung ke modul AI Gemini 2.0. Silakan klik tombol coba lagi."}
                </p>
              </div>
              <Button
                onClick={() => fetchAIInsight(true)}
                className="bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-9 px-4 rounded-xl shadow-none inline-flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Coba Lagi / Refresh
              </Button>
            </div>
          ) : (
            /* success state */
            <>
              {/* Proyeksi Hasil Panen */}
              <div className="p-4 bg-[#FEFAE0]/30 rounded-xl border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">
                    Proyeksi Hasil Panen Bulan Depan
                  </span>
                  <div className="flex items-center gap-1 bg-[#606C38] text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
                    <TrendingUp className="h-3.5 w-3.5" /> +
                    {aiInsight.harvestProjection.percent}%
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-600 leading-relaxed">
                  {aiInsight.harvestProjection.summary}
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-700 pt-1">
                  {aiInsight.harvestProjection.estimates.map((est, i) => (
                    <span
                      key={i}
                      className="bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-none"
                    >
                      {est.type}: {est.kg.toLocaleString("id-ID")} Kg
                    </span>
                  ))}
                </div>
              </div>

              {/* Estimasi Profit */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                <div className="space-y-0.5 flex-1">
                  <p className="text-xs font-bold text-gray-900">
                    Estimasi Profitabilitas
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">
                    {aiInsight.profitEstimate.summary}
                  </p>
                </div>
                <span className="text-lg font-extrabold text-[#606C38] shrink-0">
                  +{aiInsight.profitEstimate.percent}%
                </span>
              </div>

              {/* render rekomendasi taktis agronomis */}
              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-[#606C38]" />
                  Rekomendasi Taktis Kebun & Keuangan:
                </span>
                <ul className="space-y-1.5 pt-1">
                  {aiInsight.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-gray-700 font-medium flex items-start gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#606C38] shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
