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
  ChevronRight,
  CheckCircle2,
  Truck,
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
import { toast } from "sonner";

// inline types biar client side ga import prisma
type RewardCatalog = any;
type EcoPointTx = any;

const FALLBACK_ECO_MISSIONS = [
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
    title: "Pemanfaatan Kompos Kelapa di Kebun",
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
  pertanian: Leaf,
  digital: Zap,
  default: Gift,
};

export default function EcoPointsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReward, setSelectedReward] = useState<RewardCatalog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  // Setor Limbah Modal State
  const [openSetorModal, setOpenSetorModal] = useState(false);
  const [wasteType, setWasteType] = useState("SABUT");
  const [wasteWeight, setWasteWeight] = useState("");
  const [wasteMethod, setWasteMethod] = useState("PICKUP");
  const [isSubmittingWaste, setIsSubmittingWaste] = useState(false);

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
      toast.success("Penukaran poin berhasil!");
      await fetchEcoPointsData(); // Refresh data
      setTimeout(() => {
        setSelectedReward(null);
        setRedeemSuccess(false);
      }, 1500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetorLimbah = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(wasteWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error("Masukkan berat limbah yang valid (lebih dari 0 Kg).");
      return;
    }

    try {
      setIsSubmittingWaste(true);
      const res = await fetch("/api/app/eco-points/setor-limbah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          komoditasType: wasteType,
          beratKg: weight,
          pengirimanMethod: wasteMethod,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Gagal menyetor limbah.");
      }

      toast.success(
        `Berhasil menyetor ${weight} Kg ${wasteType}! +${resData.pointsEarned} EcoPoints diperoleh.`
      );
      setOpenSetorModal(false);
      setWasteWeight("");
      await fetchEcoPointsData();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyetor limbah.");
    } finally {
      setIsSubmittingWaste(false);
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

  const nextTierNeeded = Math.max(
    0,
    (data.summary?.nextTierPoints || 1500) - (data.balance || 0),
  );
  const progressPercent = Math.min(
    100,
    Math.round(
      ((data.balance || 0) / (data.summary?.nextTierPoints || 1500)) * 100,
    ),
  );

  const missions = data.activeMissions || FALLBACK_ECO_MISSIONS;

  return (
    <div
      data-tour="halaman-Eco"
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]"
    >
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
          <Button
            data-tour="setor-limbah"
            onClick={() => setOpenSetorModal(true)}
            className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-4 shadow-none flex items-center gap-2 transition-colors shrink-0"
          >
            <PlusCircle className="h-4 w-4" /> Setor Limbah Kelapa
          </Button>
        </div>
      </div>

      {/* TOP METRIC CARDS */}
      <div
        data-tour="statistik-Eco"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {/* card 1: total ecopoints & integrated progress level */}
        <Card
          data-tour="statistik-poin"
          className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                TOTAL ECOPOINT SAYA
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {(data.balance || 0).toLocaleString("id-ID")} Poin
              </h2>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#606C38]/10 text-[#606C38] flex items-center justify-center shrink-0">
              <Recycle className="h-5 w-5" />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <Badge
              variant="outline"
              className="bg-[#606C38]/10 text-[#606C38] border-[#606C38]/20 font-bold text-xs shadow-none"
            >
              Level: {data.summary?.tier || "Petani Pemula"}
            </Badge>
            <span className="text-[11px] font-bold text-gray-500">
              {(data.balance || 0).toLocaleString("id-ID")} /{" "}
              {(data.summary?.nextTierPoints || 500).toLocaleString("id-ID")}
            </span>
          </div>

          <div className="space-y-1">
            <Progress value={progressPercent} className="h-2 bg-gray-100" />
            <p className="text-[10px] font-semibold text-gray-400 text-right">
              {nextTierNeeded > 0
                ? `${nextTierNeeded.toLocaleString("id-ID")} poin lagi ke level berikutnya`
                : "Level Maksimal Tercapai!"}
            </p>
          </div>
          <Link
            href="/app/EcoPointTrade"
            className="group inline-flex items-center gap-1 w-fit bg-[#606C38]/5 rounded-xl transition-all px-4 py-2 border border-[#606C38]/20 hover:bg-[#606C38]/10 hover:border-[#606C38]/40"
          >
            <span className="text-[#606C38] text-xs font-semibold">
              Tukar Poin
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1" />
          </Link>
        </Card>

        {/* card 2: estimasi emisi co2 ditekan */}
        <Card
          data-tour="statistik-emisi"
          className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-2 flex flex-col justify-between"
        >
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
              {data.summary?.totalCo2ReducedKg || 0} Kg CO₂
            </h3>
            <p className="text-[11px] font-medium text-[#606C38] mt-1">
              Net-Zero Carbon Contribution
            </p>
          </div>
        </Card>

        {/* card 3: total limbah disetor */}
        <Card
          data-tour="statistik-setor"
          className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-2 flex flex-col justify-between"
        >
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
              {(data.summary?.wasteExchangedKg || 0).toLocaleString("id-ID")} Kg
            </h3>
            <p className="text-[11px] font-medium text-gray-500 mt-1">
              Sabut, Tempurung & Air Kelapa
            </p>
          </div>
        </Card>

        {/* card 4: peringkat saya (se-indonesia) */}
        <Card
          data-tour="statistik-peringkat"
          className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-2 flex flex-col justify-between"
        >
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
              #{data.summary?.rank || 124}
            </h3>
            <p className="text-[11px] font-medium text-gray-500 mt-1">
              dari {(data.summary?.totalFarmersCount || 10000).toLocaleString("id-ID")} Petani
            </p>
          </div>
        </Card>
      </div>

      {/* Main Grid: EcoMission & ExchangeWidget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rewards & EcoMission */}
        <div className="lg:col-span-8 space-y-6">
          <Card
            data-tour="katalog-hadiah"
            className="bg-white border border-gray-200 rounded-2xl shadow-none"
          >
            <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-[#606C38]" />
                <CardTitle className="text-base font-bold text-gray-900">
                  Katalog Hadiah Eco Points (Exchange)
                </CardTitle>
              </div>
              <Link
                href="/app/EcoPointTrade"
                className="text-xs font-bold text-[#606C38] hover:underline"
              >
                Lihat Semua
              </Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.rewards?.slice(0, 6).map((rw: RewardCatalog) => {
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
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
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
          <Card
            data-tour="misi-eco"
            className="bg-white border border-gray-200 rounded-2xl shadow-none"
          >
            <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-bold text-gray-900">
                Misi Berkelanjutan (Active Missions)
              </CardTitle>
              <Link
                href="/app/EcoPointTrade/Mission"
                className="text-xs font-bold text-[#606C38] hover:underline"
              >
                Lihat Semua Misi
              </Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {missions.map((ms: any) => (
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
          <Card
            data-tour="riwayat-transaksi"
            className="bg-white border border-gray-200 rounded-2xl shadow-none"
          >
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-bold text-gray-900">
                Riwayat Transaksi Poin
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {data.history && data.history.length > 0 ? (
                data.history.map((log: EcoPointTx) => (
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
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">
                  Belum ada riwayat transaksi poin.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Setor Limbah Modal */}
      <Dialog open={openSetorModal} onOpenChange={setOpenSetorModal}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Recycle className="w-5 h-5 text-[#606C38]" /> Setor Limbah & Dapatkan Poin
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Setorkan produk sampingan kelapa (sabut, tempurung, atau air kelapa) untuk menambah saldo EcoPoints dan mendukung ekonomi sirkular.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSetorLimbah} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Jenis Limbah / Komoditas Sampingan
              </label>
              <select
                value={wasteType}
                onChange={(e) => setWasteType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#606C38]"
              >
                <option value="SABUT">Sabut Kelapa Kering</option>
                <option value="TEMPURUNG">Batok / Tempurung Kelapa</option>
                <option value="AIR_KELAPA">Air Kelapa Segar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Perkiraan Berat / Volume (Kg)
              </label>
              <input
                type="number"
                step="any"
                required
                min="1"
                value={wasteWeight}
                onChange={(e) => setWasteWeight(e.target.value)}
                placeholder="Contoh: 50"
                className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#606C38]"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                *Estimasi perolehan: 1 Kg limbah = 1 EcoPoint (Min. 10 Pts)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Metode Penyerahan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWasteMethod("PICKUP")}
                  className={`h-10 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${wasteMethod === "PICKUP" ? "border-[#606C38] bg-[#606C38]/10 text-[#606C38]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  <Truck className="w-3.5 h-3.5" /> Jemput di Kebun
                </button>
                <button
                  type="button"
                  onClick={() => setWasteMethod("SELF_DELIVERY")}
                  className={`h-10 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${wasteMethod === "SELF_DELIVERY" ? "border-[#606C38] bg-[#606C38]/10 text-[#606C38]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Antar ke Koperasi
                </button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenSetorModal(false)}
                className="h-10 rounded-xl border-gray-200 text-xs font-bold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingWaste}
                className="h-10 rounded-xl bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold shadow-none flex items-center justify-center gap-1.5"
              >
                {isSubmittingWaste ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  "Konfirmasi Setor Limbah"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
            <div className="py-4 text-center text-xs font-bold text-[#606C38] flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Penukaran Berhasil! Voucher telah dibuat.
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
