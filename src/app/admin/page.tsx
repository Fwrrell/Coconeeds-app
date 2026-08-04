"use client";

import { useEffect, useState } from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { useAdminStore } from "@/hooks/useAdminStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Handshake,
  Ship,
  CheckCircle,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";

interface Kpi {
  totalPetani: { value: number; growth: number };
  kargoGudang: { value: number; growth: number };
  kargoBerlayar: { value: number; growth: number };
  totalDeals: { value: number; growth: number };
}

interface ChartDataPoint {
  date: string;
  kopra: number;
  sabut: number;
}

interface ActivityItem {
  id: string;
  date: string;
  type: "qc" | "logistics" | "deal";
  title: string;
  description: string;
}

interface DashboardData {
  kpi: Kpi;
  chart: ChartDataPoint[];
  activity: ActivityItem[];
}

const activityIcons = {
  qc: <CheckCircle className="h-4 w-4 text-[#606C38]" />,
  logistics: <Ship className="h-4 w-4 text-[#BC6C25]" />,
  deal: <Handshake className="h-4 w-4 text-[#283618]" />,
};

function formatTimeAgo(isoDate: string) {
  const date = new Date(isoDate);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit lalu";
  return "Baru saja";
}

export default function DashboardPage() {
  const { activeKopdesId } = useAdminStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentKopdes = activeKopdesId || "ALL";

    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/dashboard?kopdesId=${currentKopdes}`);
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [activeKopdesId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 bg-[#FFFFFF] min-h-screen font-['Quicksand',sans-serif]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#606C38]/10 text-[#606C38]">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Ringkasan Performa & Ekosistem
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Metrik agregasi bisnis, tren volume komoditas, dan pemantauan
            aktivitas real-time.
          </p>
        </div>
      </div>

      {/* Metric Section Cards */}
      <SectionCards kpi={isLoading ? null : (data?.kpi ?? null)} />

      {/* Main Grid: Chart & Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <ChartAreaInteractive
            chartData={isLoading ? null : (data?.chart ?? [])}
          />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-gray-200 rounded-md shadow-none h-full overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-[#FEFAE0]/30 py-3.5 px-5">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#606C38]" />
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription className="text-xs font-medium text-gray-500">
                5 log aktivitas mutakhir dari seluruh sistem Kopdes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : data?.activity?.length === 0 ? (
                <div className="text-center py-8 text-xs font-medium text-gray-400">
                  Belum ada aktivitas terekam.
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.activity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-md border border-gray-100 hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100">
                        {activityIcons[item.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 leading-snug">
                          {item.title}
                        </p>
                        <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <time className="ml-auto text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                        {formatTimeAgo(item.date)}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
