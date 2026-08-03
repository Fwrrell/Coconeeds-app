"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Recycle,
  Gift,
  Coins,
  Leaf,
  Zap,
  Wallet,
  PlusCircle,
  Loader2,
  Trophy,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// inline types dlu biar client side ga import prisma
type RewardCatalog = any;
type EcoPointTx = any;

// --- STATIC MOCK DATA (Eco Points) ---
const MOCK_ECO_MISSIONS = [
  {
    id: "ms-1",
    title: "Setor 500 Kg Sabut Kelapa Kering",
    reward: "+250 Pts",
    progress: 80,
    isCompleted: false,
  },
  {
    id: "ms-2",
    title: "Setor 200 Kg Batok Tempurung Kelapa",
    reward: "+150 Pts",
    progress: 100,
    isCompleted: true,
  },
  {
    id: "ms-3",
    title: "Gunakan Kompos Kelapa di Kebun Blok A",
    reward: "+100 Pts",
    progress: 60,
    isCompleted: false,
  },
];

const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const iconMap: { [key: string]: React.ElementType } = {
  Utilities: Zap,
  "E-Wallet": Wallet,
  Pertanian: Leaf,
  default: Gift,
};

export default function EcoPointsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReward, setSelectedReward] = useState<RewardCatalog | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const fetchEcoPointsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/app/eco-points");
      if (!res.ok) throw new Error("Gagal memuat data Eco Points");
      const fetchedData = await res.json();
      setData(fetchedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEcoPointsData();
  }, [fetchEcoPointsData]);

  const handleRedeemReward = async () => {
    if (!selectedReward) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/app/eco-points/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: selectedReward.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menukar poin");
      }
      setRedeemSuccess(true);
      await fetchEcoPointsData(); // Refresh data
      setTimeout(() => {
        setSelectedReward(null);
        setRedeemSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#606C38]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-red-500 p-8">
        Error: {error || "Data tidak ditemukan."}. Coba refresh halaman.
      </div>
    );
  }

  const nextTierNeeded = Math.max(0, (data.summary?.nextTierPoints || 1500) - (data.balance || 1250));
  const progressPercent = Math.min(100, Math.round(((data.balance || 1250) / (data.summary?.nextTierPoints || 1500)) * 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Eco Points & Circular Economy
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            Kumpulkan poin dari setiap penukaran limbah kelapamu untuk alam dan
            dapatkan berbagai hadiah menarik!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/pengiriman"
            className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-4 shadow-none flex items-center gap-2 transition-colors shrink-0"
          >
            <PlusCircle className="h-4 w-4" /> Setor Limbah Kelapa
          </Link>
        </div>
      </div>

      {/* TOP METRIC CARDS REDESIGN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* card 1: total ecopoints & integrated progress level */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                TOTAL ECOPOINT SAYA
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {(data.balance || 1250).toLocaleString("id-ID")} Poin
              </h2>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#606C38]/10 text-[#606C38] flex items-center justify-center shrink-0">
              <Recycle className="h-5 w-5" />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <Badge variant="outline" className="bg-[#606C38]/10 text-[#606C38] border-[#606C38]/20 font-bold text-xs shadow-none">
              Level: {data.summary?.tier || "Petani Hijau"}
            </Badge>
            <span className="text-[11px] font-bold text-gray-500">
              {(data.balance || 1250).toLocaleString("id-ID")} / {(data.summary?.nextTierPoints || 1500).toLocaleString("id-ID")}
            </span>
          </div>

          <div className="space-y-1">
            <Progress value={progressPercent} className="h-2 bg-gray-100" />
            <p className="text-[10px] font-semibold text-gray-400 text-right">
              {nextTierNeeded.toLocaleString("id-ID")} poin lagi ke level berikutnya
            </p>
          </div>
        </Card>

        {/* card 2: estimasi emisi co2 ditekan */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">
              Estimasi Emisi CO₂ Ditekan
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Leaf className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900">
              {data.summary?.totalCo2ReducedKg || 420} Kg CO₂
            </h3>
            <p className="text-[11px] font-medium text-[#606C38] mt-1">
              Net-Zero Carbon Contribution
            </p>
          </div>
        </Card>

        {/* card 3: total limbah disetor */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">
              Total Limbah Disetor
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#FEFAE0] text-[#BC6C25] flex items-center justify-center shrink-0">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900">
              {data.summary?.wasteExchangedKg || 1840} Kg
            </h3>
            <p className="text-[11px] font-medium text-gray-500 mt-1">
              Sabut & Tempurung Kelapa
            </p>
          </div>
        </Card>

        {/* card 4: peringkat saya (se-indonesia) */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">
              Peringkat Saya (se-Indonesia)
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              #124
            </h3>
            <p className="text-[11px] font-medium text-gray-500 mt-1">
              dari 10.000 Petani
            </p>
          </div>
        </Card>
      </div>

      {/* Main Grid: EcoMission & ExchangeWidget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rewards & EcoMission */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
            <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-[#606C38]" />
                <CardTitle className="text-base font-bold text-gray-900">
                  Katalog Hadiah Eco Points (Exchange)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.rewards?.map((rw: RewardCatalog) => {
                  const IconComp = iconMap[rw.category] || iconMap.default;
                  return (
                    <div
                      key={rw.id}
                      className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#606C38] transition-colors space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="h-8 w-8 rounded-lg bg-[#606C38]/10 text-[#606C38] flex items-center justify-center">
                          <IconComp className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-bold text-gray-900">
                          {rw.title}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {rw.category}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#606C38]">
                          {rw.costPoints} Pts
                        </span>
                        <Button
                          size="sm"
                          disabled={
                            data.balance < rw.costPoints || isSubmitting
                          }
                          onClick={() => setSelectedReward(rw)}
                          className="h-7 text-[11px] font-bold bg-[#606C38] hover:bg-[#283618] text-white rounded-lg shadow-none"
                        >
                          Tukar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* EcoMission */}
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-bold text-gray-900">
                Misi Berkelanjutan (Active Missions)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {MOCK_ECO_MISSIONS.map((ms) => (
                <div
                  key={ms.id}
                  className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900">
                      {ms.title}
                    </h4>
                    <span className="text-xs font-extrabold text-[#606C38] bg-[#606C38]/10 px-2 py-0.5 rounded-md">
                      {ms.reward}
                    </span>
                  </div>
                  <Progress value={ms.progress} className="h-2 bg-gray-100" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: History */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-bold text-gray-900">
                Riwayat Transaksi Poin
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {data.history?.map((log: EcoPointTx) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-gray-900">
                      {log.activity}
                    </h5>
                    <span
                      className={`text-xs font-extrabold ${log.type === "EARN" ? "text-[#606C38]" : "text-amber-600"}`}
                    >
                      {log.points > 0 ? "+" : ""}
                      {log.points} Pts
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Redeem Confirmation Dialog */}
      <Dialog
        open={!!selectedReward}
        onOpenChange={() => setSelectedReward(null)}
      >
        <DialogContent className="sm:max-w-xs bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif] text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Konfirmasi Penukaran
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Apakah Anda yakin ingin menukarkan {selectedReward?.costPoints}{" "}
              Pts dengan {selectedReward?.title}?
            </DialogDescription>
          </DialogHeader>
          {redeemSuccess ? (
            <div className="py-4 text-center text-xs font-bold text-[#606C38]">
              Penukaran Berhasil! Voucher/Token telah dikirim ke PWA Wallet.
            </div>
          ) : (
            <DialogFooter className="pt-2">
              <Button
                onClick={handleRedeemReward}
                disabled={isSubmitting}
                className="w-full bg-[#606C38] text-white text-xs font-bold h-10 rounded-xl shadow-none"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Ya, Tukar Sekarang"
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
