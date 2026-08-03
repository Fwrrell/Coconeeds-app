"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Loader2,
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
import Greeting from "@/components/greetings";
import LocalDate from "@/components/localDate";
import { formatRupiah } from "@/utils/formatter";
import Image from "next/image";

const DONUT_COLORS = ["#606C38", "#DDA15E", "#283618", "#BC6C25", "#70E000"];

export default function FarmerDashboardRoot() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/app/statistik");
        if (!res.ok) throw new Error("Gagal memuat data statistik");
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

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
      <div className="text-center text-red-500 p-8">
        Error: {error || "Data tidak ditemukan."}. Coba refresh halaman.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]">
      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Greeting />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            <LocalDate /> • Kopdes Minahasa
          </p>
        </div>
      </div>

      {/* --- 4 MAIN STATISTIC CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        {farmerStats.map((data, index) => (
          <Card
            key={index}
            className="bg-white border border-gray-200 rounded-2xl shadow-none hover:border-gray-300 transition-colors"
          >
            <CardContent className="px-4 sm:p-5 flex items-center gap-4">
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
                <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                  <Link
                    href={data.link}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#606C38] hover:underline"
                  >
                    Lihat detail <ArrowRight className="h-3 w-3" />
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- CHART LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Profit Analytics Bar Chart */}
        <Card className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-none">
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
        <Card className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl shadow-none">
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
          <Link
            href="/app/ai-insight"
            className="text-xs font-bold text-[#606C38] hover:underline"
          >
            Lihat Semua
          </Link>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="p-4 bg-[#FEFAE0]/30 rounded-xl border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">
                Proyeksi Hasil Panen Bulan Depan
              </span>
              <div className="flex items-center gap-1 bg-[#606C38] text-white text-xs font-bold px-2 py-0.5 rounded-md">
                <TrendingUp className="h-3.5 w-3.5" /> +14%
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 leading-relaxed">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repellat
              aliquid quis quisquam aperiam accusantium eligendi necessitatibus.
            </p>
            <div className="flex gap-2 text-[10px] font-bold text-gray-700">
              <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200">
                Estimasi Kopra: 300 Kg
              </span>
              <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200">
                Tempurung: 450 Kg
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-gray-900">Estimasi Profit</p>
              <p className="text-[11px] font-medium text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
            <span className="text-lg font-extrabold text-[#606C38]">+10%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
