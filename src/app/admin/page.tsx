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
import { Handshake, Ship, CheckCircle, Activity } from "lucide-react";

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
  qc: <CheckCircle className="h-5 w-5 text-sky-500" />,
  logistics: <Ship className="h-5 w-5 text-amber-500" />,
  deal: <Handshake className="h-5 w-5 text-emerald-500" />,
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
    if (activeKopdesId === null) return;

    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/dashboard?kopdesId=${activeKopdesId}`);
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
    <>
      <SectionCards kpi={isLoading ? null : (data?.kpi ?? null)} />
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:gap-6 lg:px-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <ChartAreaInteractive
            chartData={isLoading ? null : (data?.chart ?? [])}
          />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription>
                5 log aktivitas terakhir dari seluruh sistem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.activity.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        {activityIcons[item.type]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>
                      <time className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
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
    </>
  );
}
