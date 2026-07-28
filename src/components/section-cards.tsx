"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  Users,
  Warehouse,
  Ship,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardsProps {
  kpi: {
    totalPetani: { value: number; growth: number };
    kargoGudang: { value: number; growth: number };
    kargoBerlayar: { value: number; growth: number };
    totalDeals: { value: number; growth: number };
  } | null;
}

const GrowthBadge = ({ value }: { value: number }) => {
  const isPositive = value >= 0;
  return (
    <Badge
      variant="outline"
      className={cn(
        isPositive ? "text-green-600 border-green-200" : "text-slate-600 border-slate-200"
      )}
    >
      {isPositive ? (
        <TrendingUpIcon className="mr-1 h-3 w-3" />
      ) : (
        <TrendingDownIcon className="mr-1 h-3 w-3" />
      )}
      {isPositive && "+"}
      {value}{value !== Math.floor(value) ? "%" : ""}
    </Badge>
  );
};


export function SectionCards({ kpi }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* CARD 1: Total Petani */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" /> Total Petani
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpi?.totalPetani.value.toLocaleString('id-ID') ?? "..."}
          </CardTitle>
          <CardAction>
             <GrowthBadge value={kpi?.totalPetani.growth ?? 0} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registrasi petani terverifikasi
          </div>
          <div className="text-muted-foreground">Dalam 30 hari terakhir</div>
        </CardFooter>
      </Card>

      {/* CARD 2: Stok Gudang */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-amber-500" /> Stok Gudang
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(kpi ? (kpi.kargoGudang.value / 1000).toFixed(1) : "...")}{" "}
            <span className="text-lg font-normal text-muted-foreground">
              Ton
            </span>
          </CardTitle>
          <CardAction>
             <GrowthBadge value={kpi?.kargoGudang.growth ?? 0} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Kargo siap untuk AI Pooling
          </div>
          <div className="text-muted-foreground">Status: IN_WAREHOUSE</div>
        </CardFooter>
      </Card>

      {/* CARD 3: Kargo Berlayar */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Ship className="h-4 w-4 text-emerald-500" /> Kargo Berlayar
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(kpi ? (kpi.kargoBerlayar.value / 1000).toFixed(1) : "...")}{" "}
            <span className="text-lg font-normal text-muted-foreground">
              Ton
            </span>
          </CardTitle>
          <CardAction>
            <GrowthBadge value={kpi?.kargoBerlayar.growth ?? 0} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Kargo dalam perjalanan
          </div>
          <div className="text-muted-foreground">Status: IN_TRANSIT</div>
        </CardFooter>
      </Card>

      {/* CARD 4: WTB Deals */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Handshake className="h-4 w-4 text-purple-500" /> WTB Deals
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpi?.totalDeals.value ?? "..."}
          </CardTitle>
          <CardAction>
            <GrowthBadge value={kpi?.totalDeals.growth ?? 0} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Transaksi berhasil disepakati
          </div>
          <div className="text-muted-foreground">Dalam 30 hari terakhir</div>
        </CardFooter>
      </Card>
    </div>
  );
}
