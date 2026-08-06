"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Truck,
  PackageCheck,
  CheckCircle2,
  Loader2,
  Package,
  Filter,
  Ship,
  MapPin,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BatchTrackingItem {
  id: string;
  type: string;
  totalWeight: number;
  status: "IN_WAREHOUSE" | "IN_TRANSIT" | "DELIVERED" | string;
  kopdesId?: string | null;
  wtbListingId?: string | null;
  createdAt: string;
  updatedAt: string;
  wtbListing?: {
    id: string;
    komoditas: string;
    targetWeight: number;
    dealPrice?: number | null;
    destination?: string | null;
  } | null;
  kopdes?: {
    id: string;
    name: string;
    region?: string | null;
  } | null;
  pengirimanKapal?: {
    id: string;
    namaKapal: string;
    rute: string;
    totalBiaya: number;
    totalWeight: number;
    status: string;
    createdAt: string;
  } | null;
  ledger?: {
    id: string;
    currentHash: string;
    createdAt: string;
  } | null;
  panens?: Array<{
    id: string;
    type: string;
    actualWeight: number;
    grade?: string | null;
    updatedAt?: string | null;
  }>;
}

export default function PerusahaanPengirimanPage() {
  const { data: session } = useSession();
  const [batches, setBatches] = useState<BatchTrackingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWtbFilter, setSelectedWtbFilter] = useState("ALL");
  const [selectedBatch, setSelectedBatch] = useState<BatchTrackingItem | null>(
    null,
  );

  // fetch data tracking batch kargo b2b
  const fetchData = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/perusahaan/tracking");
      const json = await res.json();
      if (res.ok) {
        setBatches(json.data || []);
      } else {
        toast.error(json.error || "Gagal mengambil data pengiriman.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  // rilis pembayaran ke kopdes via api settlement
  const handleConfirmSettlement = async () => {
    if (!selectedBatch) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/settlement/${selectedBatch.id}`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(
          "Penerimaan barang dikonfirmasi! Pembayaran telah dirilis ke Kopdes.",
        );
        setSelectedBatch(null);
        fetchData();
      } else {
        toast.error(json.error || "Gagal melakukan konfirmasi settlement.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem saat settlement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // filter batch berdasar wtbId
  const filteredBatches =
    selectedWtbFilter === "ALL"
      ? batches
      : batches.filter((b) => b.wtbListingId === selectedWtbFilter);

  // kumpulkan wtb unik untuk dropdown filter
  const uniqueWtbs = Array.from(
    new Map(
      batches
        .filter((b) => b.wtbListing)
        .map((b) => [b.wtbListing!.id, b.wtbListing!]),
    ).values(),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#606C38] text-white flex items-center justify-center">
              <Truck className="h-4 w-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Tracking Pengiriman Logistik B2B
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            Pantau status armada kapal, status transit, dan rilis pembayaran
            setelah barang diterima.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={selectedWtbFilter}
            onValueChange={(val) => setSelectedWtbFilter(val || "ALL")}
          >
            <SelectTrigger className="w-[220px] h-10 rounded-xl border-gray-300 text-xs font-bold bg-white">
              <SelectValue placeholder="Filter Purchase Request" />
            </SelectTrigger>
            <SelectContent className="font-['Quicksand',sans-serif]">
              <SelectItem value="ALL" className="font-bold text-[#606C38]">
                Semua Purchase Request
              </SelectItem>
              {uniqueWtbs.map((wtb) => (
                <SelectItem key={wtb.id} value={wtb.id}>
                  {wtb.komoditas} ({wtb.id.slice(0, 8).toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Shipments Cards & Timeline */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12 text-gray-500 text-xs font-semibold">
            <Loader2 className="h-6 w-6 animate-spin text-[#606C38] mr-2" />
            Memuat data pengiriman kargo...
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl space-y-3">
            <Package className="mx-auto h-10 w-10 text-gray-400" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">
                Belum Ada Pengiriman Kargo
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Belum ada batch kargo terhubung dengan Purchase Request
                perusahaan Anda.
              </p>
            </div>
          </div>
        ) : (
          filteredBatches.map((b) => {
            const trackingCode = `TRK-${b.id.slice(0, 8).toUpperCase()}`;
            const prCode = b.wtbListingId
              ? `PR-${b.wtbListingId.slice(0, 8).toUpperCase()}`
              : "N/A";
            const komoditasName = b.wtbListing?.komoditas || b.type;
            const kopdesName = b.kopdes?.name || "Kopdes Mitrage";

            // render stepper dinamis dari timestamp & status
            const konsolidasiTime = b.createdAt
              ? new Date(b.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })
              : "—";

            const qcTime = b.ledger?.createdAt
              ? new Date(b.ledger.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })
              : b.panens?.[0]?.updatedAt
                ? new Date(b.panens[0].updatedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })
                : "—";

            const dispatchTime = b.pengirimanKapal?.createdAt
              ? new Date(b.pengirimanKapal.createdAt).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "short",
                  },
                )
              : "Menunggu Dispatch";

            const isTransitDone =
              b.pengirimanKapal?.status === "IN_TRANSIT" ||
              b.pengirimanKapal?.status === "ARRIVED" ||
              b.status === "DELIVERED";

            const isDelivered = b.status === "DELIVERED";

            const stages = [
              {
                label: "Konsolidasi Panen Kopdes",
                time: konsolidasiTime,
                isDone: true,
              },
              {
                label: "Verifikasi QC & Ledger Block",
                time: qcTime,
                isDone: Boolean(b.ledger || (b.panens && b.panens.length > 0)),
              },
              {
                label: "Dispatch Kapal Logistik",
                time: dispatchTime,
                isDone: Boolean(b.pengirimanKapal),
              },
              {
                label: "Transit Logistik Real-Time",
                time: isTransitDone
                  ? "Dalam Perjalanan / Arrived"
                  : "Menunggu Transit",
                isDone: isTransitDone,
              },
              {
                label: "Konfirmasi & Pembayaran Lunas",
                time: isDelivered
                  ? "Lunas (Payment Released)"
                  : "Menunggu Konfirmasi",
                isDone: isDelivered,
              },
            ];

            return (
              <Card
                key={b.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-none hover:border-gray-300 transition-colors"
              >
                <CardHeader className="pb-3 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 space-y-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#606C38]">
                        {trackingCode}
                      </span>
                      <CardTitle className="text-base font-bold text-gray-900">
                        {komoditasName}
                      </CardTitle>
                    </div>
                    <p className="text-xs font-medium text-gray-500">
                      Pengirim:{" "}
                      <span className="font-bold text-gray-800">
                        {kopdesName}
                      </span>{" "}
                      (Kontrak: {prCode})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        isDelivered
                          ? "bg-emerald-600 text-white font-bold text-xs"
                          : b.pengirimanKapal?.status === "IN_TRANSIT"
                            ? "bg-blue-600 text-white font-bold text-xs"
                            : "bg-[#606C38] text-white font-bold text-xs"
                      }
                    >
                      {isDelivered
                        ? "BARANG DITERIMA & LUNAS"
                        : b.pengirimanKapal?.status === "IN_TRANSIT"
                          ? "IN TRANSIT"
                          : "SIAP DIKAPALKAN"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Delivery Details Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Volume Kargo
                      </span>
                      <p className="text-sm font-extrabold text-gray-900">
                        {b.totalWeight.toLocaleString("id-ID")} Kg
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                        <Ship className="h-3 w-3 text-gray-500" /> Kapal &
                        Armada
                      </span>
                      <p className="text-xs font-bold text-gray-800">
                        {b.pengirimanKapal
                          ? `${b.pengirimanKapal.namaKapal} (${b.pengirimanKapal.rute})`
                          : "Belum Ditetapkan"}
                      </p>
                    </div>
                    <div className="p-3 bg-[#FEFAE0]/30 rounded-xl border border-gray-200/80 space-y-0.5">
                      <span className="text-[10px] font-bold text-[#BC6C25] uppercase">
                        Tujuan Pengiriman
                      </span>
                      <p className="text-xs font-extrabold text-[#606C38] flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {b.wtbListing?.destination || "Gudang Utama B2B"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Ledger Chaining
                      </span>
                      <p className="text-xs font-mono font-bold text-gray-800 truncate">
                        {b.ledger?.currentHash
                          ? `${b.ledger.currentHash.slice(0, 12)}...`
                          : "Pending Chaining"}
                      </p>
                    </div>
                  </div>

                  {/* Vertical / Horizontal Stepper Timeline */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700">
                      Tahapan Status Pengiriman Logistik:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
                      {stages.map((stg, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            stg.isDone
                              ? "bg-[#606C38]/10 border-[#606C38]/30 text-gray-900"
                              : "bg-gray-50 border-gray-200 text-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            <CheckCircle2
                              className={`h-4 w-4 ${
                                stg.isDone ? "text-[#606C38]" : "text-gray-300"
                              }`}
                            />
                            <span className="text-[11px] leading-tight">
                              {stg.label}
                            </span>
                          </div>
                          <span className="block text-[10px] font-medium text-gray-500">
                            {stg.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Action Button for Payment Release Confirmation */}
                  <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                    {!isDelivered && (
                      <Button
                        onClick={() => setSelectedBatch(b)}
                        className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs h-10 px-5 rounded-xl shadow-none flex items-center gap-2 w-full sm:w-auto"
                      >
                        <PackageCheck className="h-4 w-4" /> Konfirmasi & Rilis
                        Pembayaran
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Goods Receipt Confirmation Modal */}
      <Dialog
        open={!!selectedBatch}
        onOpenChange={() => setSelectedBatch(null)}
      >
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif] text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Konfirmasi Penerimaan Barang & Settlement
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Konfirmasi bahwa kargo TRK-
              {selectedBatch?.id.slice(0, 8).toUpperCase()} (
              {selectedBatch?.totalWeight.toLocaleString("id-ID")} Kg) telah
              diterima di gudang pabrik dan dana siap dirilis ke Kopdes.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 flex flex-col gap-2">
            <Button
              disabled={isSubmitting}
              onClick={handleConfirmSettlement}
              className="w-full bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-11 rounded-xl shadow-none"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Konfirmasi & Rilis Pembayaran"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
