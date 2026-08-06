"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Leaf, Loader2, CheckCircle2, Copy } from "lucide-react";
import { Reward } from "./RewardTypes";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  reward: Reward | null;
  userBalance?: number;
  onRedeemSuccess?: (newBalance: number) => void;
}

export default function RedeemCard({
  open,
  onOpenChange,
  reward,
  userBalance = 0,
  onRedeemSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successVoucher, setSuccessVoucher] = useState<string | null>(null);

  if (!reward) return null;

  const costPoints = reward.costPoints || parseInt(reward.poin.replace(/\D/g, "") || "0");
  const remainingPoints = userBalance - costPoints;
  const isEnough = userBalance >= costPoints;

  const handleRedeem = async () => {
    if (!isEnough) {
      toast.error("Poin Anda tidak mencukupi untuk menukar hadiah ini.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/app/eco-points/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: reward.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menukarkan poin.");
      }

      const voucher = data.newTx?.voucherCode || "VCR-SUCCESS";
      setSuccessVoucher(voucher);
      toast.success("Penukaran hadiah berhasil!");

      if (data.updatedUser?.ecoPoints !== undefined) {
        onRedeemSuccess?.(data.updatedUser.ecoPoints);
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menukar hadiah.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccessVoucher(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-visible bg-gradient-to-br from-white via-[#FCFCF9] to-[#F7F8F2] border border-gray-200">
        <div className="absolute left-1/2 -translate-x-1/2 -top-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#606C38] to-[#283618] border-4 border-white flex items-center justify-center shadow-lg">
            <Leaf className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="pt-14 px-8 pb-8 flex flex-col gap-5">
          {successVoucher ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Penukaran Berhasil!
              </h2>
              <p className="text-xs text-gray-500">
                Tunjukkan kode voucher berikut ke petugas Koperasi Desa atau gunakan saat transaksi.
              </p>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between">
                <span className="font-mono font-bold text-lg text-emerald-800">
                  {successVoucher}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(successVoucher);
                    toast.success("Kode voucher disalin!");
                  }}
                  className="text-emerald-700 hover:bg-emerald-100"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleClose}
                className="w-full h-11 rounded-xl bg-[#606C38] hover:bg-[#4E592F] text-white font-bold"
              >
                Selesai
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-center rounded-xl h-36 items-center">
                <Image
                  src={reward.image || "/icon/TokenListrik.png"}
                  width={150}
                  height={150}
                  alt={reward.title}
                  className="object-contain max-h-32 w-auto"
                />
              </div>

              {/* Title */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-[#283618] border-b border-[#DDA15E]/40 pb-2">
                  {reward.title}
                </h2>
                <p className="text-xs text-gray-500">{reward.description}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F7F4EA] px-4 py-1.5 text-[#BC6C25] font-bold text-sm">
                  <Leaf className="w-4 h-4" />
                  {costPoints.toLocaleString("id-ID")} EcoPoints
                </div>
              </div>

              <div className="rounded-xl border border-[#CBE7D5] bg-gradient-to-r from-[#F7F9F2] to-[#EEF4E6] px-4 py-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Saldo Poin Kamu</span>
                  <span className="font-bold text-gray-800">
                    {userBalance.toLocaleString("id-ID")} Points
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya Penukaran</span>
                  <span className="font-bold text-[#BC6C25]">
                    - {costPoints.toLocaleString("id-ID")} Points
                  </span>
                </div>
                <div className="border-t border-[#CBE7D5] pt-1.5 flex justify-between">
                  <span className="font-semibold text-gray-700">Sisa EcoPoints</span>
                  <span className={`font-bold ${remainingPoints < 0 ? "text-red-600" : "text-[#606C38]"}`}>
                    {remainingPoints.toLocaleString("id-ID")} Points
                  </span>
                </div>
              </div>

              {!isEnough && (
                <p className="text-[11px] text-red-500 font-semibold text-center">
                  ⚠️ Poin belum mencukupi. Dapatkan lebih banyak poin dengan menyetor limbah atau menyelesaikan misi harian!
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="h-11 rounded-xl bg-white border border-[#D9DED3] hover:bg-[#F7F4EA] text-gray-700 font-semibold"
                >
                  Batal
                </Button>

                <Button
                  disabled={!isEnough || isSubmitting}
                  onClick={handleRedeem}
                  className="h-11 rounded-xl bg-[#606C38] hover:bg-[#4E592F] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menukar...
                    </>
                  ) : (
                    "Tukar Sekarang"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
