"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Truck,
  PlusCircle,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  QrCode,
  KeyRound,
  ShieldCheck,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  AlertCircle,
  AlertTriangle,
  History,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { cn } from "@/lib/utils";
import { registerDialog } from "@/lib/tourGuide/tourController";
// hapus prisma import biar vercel ga komplain client side
type Panen = any;
type Kopdes = any;
type FarmerInventory = any;
type PanenStatus = string;
type PengirimanMethod = string;
import { formatRupiah } from "@/utils/formatter";
import Image from "next/image";

type PanenWithKopdes = Panen & { kopdes: { name: string } | null };

const STAGES: { name: string; status: PanenStatus[] }[] = [
  { name: "Penjemputan", status: ["PENDING_PICKUP", "PENDING_DROPOFF"] },
  { name: "Pemeriksaan Kualitas", status: ["QC_IN_PROGRESS"] },
  { name: "Disimpan di Gudang Kopdes", status: ["IN_WAREHOUSE"] },
  { name: "Pengiriman Barang", status: ["IN_TRANSIT"] },
  { name: "Produk Diterima", status: ["DELIVERED"] },
];

const getStatusBadge = (status: PanenStatus) => {
  switch (status) {
    case "PENDING_PICKUP":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs shadow-none">
          Menunggu Penjemputan
        </Badge>
      );
    case "PENDING_DROPOFF":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs shadow-none">
          Menunggu Setor Mandiri
        </Badge>
      );
    case "QC_IN_PROGRESS":
      return (
        <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 font-bold text-xs shadow-none">
          Pemeriksaan Kualitas
        </Badge>
      );
    case "IN_WAREHOUSE":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-xs shadow-none">
          Di Gudang Kopdes
        </Badge>
      );
    case "IN_TRANSIT":
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold text-xs shadow-none">
          Kargo Logistik
        </Badge>
      );
    case "DELIVERED":
      return (
        <Badge className="bg-[#606C38]/15 text-[#606C38] border-[#606C38]/30 font-bold text-xs shadow-none">
          Selesai Penjualan
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="text-gray-500 font-bold text-xs shadow-none"
        >
          {status}
        </Badge>
      );
  }
};

export default function FarmerPengirimanPage() {
  const [activeShipments, setActiveShipments] = useState<PanenWithKopdes[]>([]);
  const [historyShipments, setHistoryShipments] = useState<PanenWithKopdes[]>(
    [],
  );
  const [availableInventory, setAvailableInventory] = useState<
    FarmerInventory[]
  >([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedOrderId, setExpandedOrderId] = useState<string>("");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [validationModalData, setValidationModalData] =
    useState<PanenWithKopdes | null>(null);

  // Form State
  const [selectedBarang, setSelectedBarang] = useState("");
  const [jumlahPengiriman, setJumlahPengiriman] = useState<number | string>("");
  const [hargaDasar, setHargaDasar] = useState<number | string>("");
  const [metodeForm, setMetodeForm] = useState<PengirimanMethod>("PICKUP");
  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format
  const [tanggalForm, setTanggalForm] = useState(todayStr);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [shipmentRes, inventoryRes, profileRes] = await Promise.all([
        fetch("/api/app/pengiriman"),
        fetch("/api/app/inventori"),
        fetch("/api/app/profil"),
      ]);
      if (!shipmentRes.ok || !inventoryRes.ok)
        throw new Error("Gagal memuat data awal");

      const shipmentData = await shipmentRes.json();
      const inventoryData = await inventoryRes.json();
      const profileData = profileRes.ok ? await profileRes.json() : null;

      setActiveShipments(shipmentData.activeShipments || []);
      setHistoryShipments(shipmentData.historyShipments || []);
      setAvailableInventory(inventoryData.stocks || []);
      setUserProfile(profileData);

      if (
        shipmentData.activeShipments &&
        shipmentData.activeShipments.length > 0
      ) {
        setExpandedOrderId(shipmentData.activeShipments[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Helper fungsi untuk membuka dan menutup dialog dari App Tour
  const openPengirimanDialog = () => {
    setIsCreateModalOpen(true);
  };

  const closePengirimanDialog = () => {
    setIsCreateModalOpen(false);
  };

  useEffect(() => {
    registerDialog("open-pengiriman-dialog", openPengirimanDialog);
    registerDialog("close-pengiriman-dialog", closePengirimanDialog);
  }, []);

  // Handle selectedBarang auto-select first available item
  useEffect(() => {
    if (availableInventory.length > 0 && !selectedBarang) {
      setSelectedBarang(availableInventory[0].jenisProduk);
    }
  }, [availableInventory, selectedBarang]);

  // Dynamic Stock Label & Max Stock Helper
  const currentStockObj = useMemo(() => {
    return availableInventory.find(
      (item) => item.jenisProduk === selectedBarang,
    );
  }, [availableInventory, selectedBarang]);

  // Estimasi pendapatan = berat * harga dasar
  const estimasiPendapatan = useMemo(() => {
    const b = Number(jumlahPengiriman) || 0;
    const h = Number(hargaDasar) || 0;
    return b * h;
  }, [jumlahPengiriman, hargaDasar]);

  const handleCreateShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isVerified = Boolean(userProfile?.kopdes?.id);
    if (!isVerified) {
      alert(
        "Akun Anda belum diverifikasi oleh Admin dan belum terhubung dengan Kopdes.",
      );
      setIsSubmitting(false);
      return;
    }

    if (new Date(tanggalForm) < new Date(todayStr)) {
      alert("Tanggal pengiriman tidak boleh lebih kecil dari tanggal hari ini.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/app/pengiriman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          komoditasType: selectedBarang,
          beratKg: Number(jumlahPengiriman),
          hargaDasar: Number(hargaDasar),
          kopdesId: userProfile?.kopdes?.id,
          pengirimanMethod: metodeForm,
          tanggalPanen: tanggalForm,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal membuat pengiriman");
      }
      setCreateSuccess(true);
      await fetchInitialData();
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setCreateSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateShipmentSubmitWithTour = (e: React.FormEvent) => {
    handleCreateShipmentSubmit(e);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FFFFFF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#606C38]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 font-['Quicksand',sans-serif]">
        Error: {error}. Silakan coba refresh halaman.
      </div>
    );
  }

  return (
    <div
      data-tour="halaman-pengiriman"
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Manajemen Pengiriman & Logistik Laut
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            Pantau status penyerahan komoditas kelapa, validasi PIN/QR
            penjemputan Kopdes, dan riwayat pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            data-tour="buat-pengiriman"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-4 shadow-none flex items-center gap-2 transition-colors shrink-0"
          >
            <PlusCircle className="h-4 w-4" /> Buat Pengiriman Baru
          </Button>
        </div>
      </div>

      {/* --- ACTIVE SHIPMENTS SECTION --- */}
      <div className="space-y-4" data-tour="pengiriman-berjalan">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#606C38]" />
            Pengiriman Aktif ({activeShipments.length})
          </h2>
        </div>

        {activeShipments.length === 0 ? (
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-8 text-center">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-700">
              Belum Ada Pengiriman Aktif
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Buat permintaan pengiriman barang dari gudang Anda ke Kopdes.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeShipments.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <Card
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-none overflow-hidden transition-all"
                >
                  <CardHeader className="p-4 sm:p-5 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs font-semibold text-gray-500">
                        {order.type} • {order.expectedWeight} {order.satuan} •
                        Destinasi:{" "}
                        <span className="text-gray-900 font-bold">
                          {order.kopdes?.name || "Kopdes Terhubung"}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                      {(order.status === "PENDING_PICKUP" ||
                        order.status === "PENDING_DROPOFF") && (
                        <Button
                          size="sm"
                          onClick={() => setValidationModalData(order)}
                          className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs rounded-xl h-9 px-3 shadow-none flex items-center gap-1.5"
                        >
                          <QrCode className="h-4 w-4" /> Validasi Penyerahan
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? "" : order.id)
                        }
                        className="text-xs font-bold text-gray-600 rounded-xl h-9 px-3"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Expanded Tracker Section */}
                  {isExpanded && (
                    <CardContent className="p-4 sm:p-6 space-y-6">
                      {/* Stepper Status Bar */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                          Progres Pelacakan Pengiriman
                        </span>
                        <div className="grid grid-cols-5 gap-1.5 pt-2">
                          {STAGES.map((st, idx) => {
                            const isCurrent = st.status.includes(order.status);
                            return (
                              <div
                                key={st.name}
                                className="space-y-1.5 text-center"
                              >
                                <div
                                  className={cn(
                                    "h-2 rounded-full transition-colors",
                                    isCurrent ? "bg-[#606C38]" : "bg-gray-200",
                                  )}
                                />
                                <span className="text-[10px] font-bold text-gray-600 block line-clamp-1">
                                  {st.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Detail Transaksi Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 text-xs">
                        <div className="p-3 rounded-xl bg-gray-50/50 space-y-1">
                          <span className="font-bold text-gray-400 text-[10px] uppercase">
                            Metode Delivery
                          </span>
                          <p className="font-bold text-gray-900">
                            {order.pengirimanMethod === "PICKUP"
                              ? "Penjemputan"
                              : "Setor Mandiri"}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50/50 space-y-1">
                          <span className="font-bold text-gray-400 text-[10px] uppercase">
                            Tanggal Permintaan
                          </span>
                          <p className="font-bold text-gray-900">
                            {new Date(order.tanggalPanen).toLocaleDateString(
                              "id-ID",
                            )}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50/50 space-y-1">
                          <span className="font-bold text-gray-400 text-[10px] uppercase">
                            Jadwal Penjemputan
                          </span>
                          <p className="font-bold text-gray-900">
                            {order.pickupScheduledAt
                              ? new Date(
                                  order.pickupScheduledAt,
                                ).toLocaleDateString("id-ID")
                              : "Menunggu konfirmasi jadwal"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* --- HISTORY SECTION --- */}
      <div className="space-y-4 pt-4" data-tour="riwayat-pengiriman">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <History className="h-5 w-5 text-gray-500" />
          Riwayat Pengiriman Selesai ({historyShipments.length})
        </h2>

        {historyShipments.length === 0 ? (
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-6 text-center text-xs text-gray-400 font-medium">
            Belum ada riwayat pengiriman yang selesai.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {historyShipments.map((h) => (
              <Card
                key={h.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-none p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    {h.type}
                  </span>
                  {getStatusBadge(h.status)}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Berat: {h.expectedWeight} {h.satuan}
                  </span>
                  <span>
                    {new Date(h.tanggalPanen).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL 1: BUAT PENGIRIMAN BARU --- */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-[#606C38]" />
              Buat Pengiriman Baru
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Pilih produk kelapa dari gudang Anda untuk diserahkan ke
              penjemputan Kopdes.
            </DialogDescription>
          </DialogHeader>

          {createSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-[#606C38]/10 text-[#606C38] flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Pengiriman Berhasil Dibuat!
              </h3>
              <p className="text-xs font-medium text-gray-500">
                Menunggu penyerahan barang & verifikasi PIN Kopdes.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleCreateShipmentSubmitWithTour}
              className="space-y-4 py-2"
            >
              {/* 1. Pilih Barang dari Gudang */}
              <div className="space-y-1.5" data-tour="form-pilih-barang">
                <Label className="text-xs font-bold text-gray-700">
                  Pilih Barang dari Gudang
                </Label>
                <Select
                  value={selectedBarang}
                  onValueChange={(value) => value && setSelectedBarang(value)}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl border-gray-300 text-xs">
                    <SelectValue placeholder="Pilih Barang" />
                  </SelectTrigger>
                  <SelectContent className="font-['Quicksand',sans-serif]">
                    {availableInventory.map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.jenisProduk}
                        disabled={item.jumlah <= 0}
                      >
                        {item.jenisProduk} (Tersedia: {item.jumlah}{" "}
                        {item.satuan})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Jumlah Pengiriman */}
              <div className="space-y-1.5" data-tour="form-jumlah-pengiriman">
                <Label className="text-xs font-bold text-gray-700">
                  Jumlah Pengiriman (
                  {availableInventory.find(
                    (i) => i.jenisProduk === selectedBarang,
                  )?.satuan || "Kg"}
                  )
                </Label>
                <Input
                  type="number"
                  placeholder="Contoh: 1000"
                  value={jumlahPengiriman}
                  onChange={(e) => setJumlahPengiriman(e.target.value)}
                  className="h-11 rounded-xl border-gray-300 text-xs"
                  required
                />
              </div>

              {/* 3. Harga Dasar ke Kopdes */}
              <div className="space-y-1.5" data-tour="form-harga-dasar">
                <Label className="text-xs font-bold text-gray-700">
                  Harga Dasar ke Kopdes (Rp / Satuan)
                </Label>
                <Input
                  type="number"
                  placeholder="Contoh: 8500"
                  value={hargaDasar}
                  onChange={(e) => setHargaDasar(e.target.value)}
                  className="h-11 rounded-xl border-gray-300 text-xs font-bold"
                  required
                />
              </div>

              {/* Estimasi Pendapatan Preview */}
              <div
                className="p-3 rounded-xl bg-[#606C38]/10 border border-[#606C38]/20 space-y-0.5"
                data-tour="form-estimasi-pendapatan"
              >
                <span className="text-[10px] font-bold text-[#606C38] uppercase block">
                  Kalkulasi Estimasi
                </span>
                <p className="text-xs font-extrabold text-[#606C38] leading-relaxed">
                  Estimasi Pendapatan Awal: {formatRupiah(estimasiPendapatan)}{" "}
                  <span className="font-medium text-gray-600">
                    (Cair ke saldo setelah lolos QC Kopdes)
                  </span>
                </p>
              </div>

              {/* 4. Pos Kopdes Tujuan (Restricted to Admin Assignment) */}
              <div className="space-y-1.5" data-tour="form-pos-kopdes">
                <Label className="text-xs font-bold text-gray-700">
                  Pos Kopdes Tujuan
                </Label>
                {userProfile?.kopdes?.id ? (
                  // user dah di assign admin, tampilin kopdes statis aja
                  <div className="h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-800">
                    <span>
                      {userProfile?.kopdes?.name || "Pos Kopdes Terhubung"}
                    </span>
                    <Badge className="bg-[#606C38]/10 text-[#606C38] border-[#606C38]/20 text-[10px] shadow-none">
                      Tervalidasi
                    </Badge>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-amber-600" /> Akun
                      Belum Terhubung Kopdes
                    </p>
                    <p className="text-[11px] leading-tight text-amber-700">
                      Akun Anda belum diverifikasi oleh Admin. Anda belum
                      terhubung dengan pos Kopdes manapun sehingga belum bisa
                      membuat pengiriman.
                    </p>
                  </div>
                )}
              </div>

              {/* 5. Metode Pengiriman & Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5" data-tour="form-metode-pengiriman">
                  <Label className="text-xs font-bold text-gray-700">
                    Metode Pengiriman
                  </Label>
                  <Select
                    value={metodeForm}
                    onValueChange={(value) => {
                      if (value) setMetodeForm(value as PengirimanMethod);
                    }}
                  >
                    <SelectTrigger className="w-full h-11 rounded-xl border-gray-300 text-xs">
                      <SelectValue placeholder="Metode">
                        {metodeForm === "PICKUP" && "Penjemputan"}
                        {metodeForm === "SELF_DELIVERY" && "Setor Mandiri"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="font-['Quicksand',sans-serif]">
                      {/* samain label dropdown biar user ga bingung value vs name */}
                      <SelectItem value="PICKUP">Penjemputan</SelectItem>
                      <SelectItem value="SELF_DELIVERY">
                        Setor Mandiri
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="space-y-1.5"
                  data-tour="form-tanggal-pengiriman"
                >
                  <Label className="text-xs font-bold text-gray-700">
                    Tanggal
                  </Label>
                  <Input
                    type="date"
                    value={tanggalForm}
                    min={todayStr}
                    onChange={(e) => setTanggalForm(e.target.value)}
                    className="h-11 rounded-xl border-gray-300 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <DialogFooter className="pt-2">
                <Button
                  data-tour="form-kirim-pengiriman"
                  type="submit"
                  // lock tombol klo blm di verify
                  disabled={isSubmitting || !userProfile?.kopdes?.id}
                  className="w-full bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-11 rounded-xl shadow-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Mengirim..." : "Kirim Permintaan Pengiriman"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* --- HANDOVER VALIDATION MODAL (6-DIGIT PIN) --- */}
      <Dialog
        open={!!validationModalData}
        onOpenChange={() => setValidationModalData(null)}
      >
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif] text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
              Kode PIN
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Tunjukkan kode PIN ini ke petugas Kopdes saat penyerahan barang.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                6-Digit PIN Penyerahan
              </span>
              <p className="text-3xl font-extrabold text-[#606C38] tracking-widest">
                {(validationModalData as any)?.handoverPin || "111111"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setValidationModalData(null)}
              className="w-full bg-[#606C38] text-white font-bold text-xs h-10 rounded-xl shadow-none"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
