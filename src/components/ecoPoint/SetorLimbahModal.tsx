"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Recycle, Truck, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SetorLimbahModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (pointsEarned: number) => void;
}

export default function SetorLimbahModal({
  open,
  onOpenChange,
  onSuccess,
}: SetorLimbahModalProps) {
  const [wasteType, setWasteType] = useState("SABUT");
  const [wasteWeight, setWasteWeight] = useState("");
  const [wasteMethod, setWasteMethod] = useState("PICKUP");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(wasteWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error("Masukkan perkiraan berat limbah yang valid (lebih dari 0 Kg).");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/app/eco-points/setor-limbah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          komoditasType: wasteType,
          beratKg: weight,
          pengirimanMethod: wasteMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyetor limbah.");
      }

      toast.success(
        `Berhasil menyetor ${weight} Kg ${wasteType}! +${data.pointsEarned} EcoPoints diperoleh.`
      );
      onOpenChange(false);
      setWasteWeight("");
      onSuccess?.(data.pointsEarned);
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyetor limbah.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Recycle className="w-5 h-5 text-[#606C38]" /> Setor Limbah & Hasil Produk
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-gray-500">
            Setorkan produk sampingan kelapa (sabut, tempurung, atau air kelapa) untuk menambah saldo EcoPoints dan mendukung ekonomi sirkular.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Jenis Limbah / Hasil Produk Sampingan
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
                className={`h-10 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  wasteMethod === "PICKUP"
                    ? "border-[#606C38] bg-[#606C38]/10 text-[#606C38]"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> Jemput di Kebun
              </button>
              <button
                type="button"
                onClick={() => setWasteMethod("SELF_DELIVERY")}
                className={`h-10 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  wasteMethod === "SELF_DELIVERY"
                    ? "border-[#606C38] bg-[#606C38]/10 text-[#606C38]"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Antar ke Koperasi
              </button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl border-gray-200 text-xs font-bold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold shadow-none flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
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
  );
}
