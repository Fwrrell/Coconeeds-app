"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  PlusCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  QrCode,
  ShieldCheck,
  KeyRound,
  Send,
  Coins,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
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
  {
    name: "1. Penjemputan",
    status: ["PENDING_PICKUP", "PENDING_DROPOFF"],
  },
  {
    name: "2. Pemeriksaan Kualitas (QC Kopdes)",
    status: ["QC_IN_PROGRESS"],
  },
  { name: "3. Gudang Kopdes", status: ["IN_WAREHOUSE"] },
  { name: "4. Gudang Off-Taker (B2B)", status: ["IN_TRANSIT"] },
  { name: "5. Produk Diterima", status: ["DELIVERED"] },
];

const getStatusInfo = (status: PanenStatus) => {
  const stageIndex = STAGES.findIndex((s) => s.status.includes(status));
  const statusLabel =
    STAGES[stageIndex]?.name.split(". ")[1] || "Status Tidak Diketahui";
  return { currentStepIndex: stageIndex, statusLabel };
};

const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function PengirimanPage() {
  const [activeShipments, setActiveShipments] = useState<PanenWithKopdes[]>([]);
  const [historyShipments, setHistoryShipments] = useState<PanenWithKopdes[]>(
    [],
  );
  const [availableInventory, setAvailableInventory] = useState<
    FarmerInventory[]
  >([]);
  const [kopdesList, setKopdesList] = useState<Kopdes[]>([]);
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
  const [kopdesForm, setKopdesForm] = useState("");
  const [metodeForm, setMetodeForm] = useState<PengirimanMethod>("PICKUP");
  const [tanggalForm, setTanggalForm] = useState(
    new Date().toISOString().split("T")[0],
  );

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [shipmentRes, inventoryRes, kopdesRes] = await Promise.all([
        fetch("/api/app/pengiriman"),
        fetch("/api/app/inventori"),
        fetch("/api/kopdes"),
      ]);
      if (!shipmentRes.ok || !inventoryRes.ok || !kopdesRes.ok)
        throw new Error("Gagal memuat data awal");

      const shipmentData = await shipmentRes.json();
      const inventoryData = await inventoryRes.json();
      const kopdesData = await kopdesRes.json();

      setActiveShipments(shipmentData.activeShipments || []);
      setHistoryShipments(shipmentData.historyShipments || []);
      setAvailableInventory(inventoryData.stocks || []);
      setKopdesList(kopdesData.data || []);

      if (shipmentData.activeShipments.length > 0) {
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

  const shipmentStats = useMemo(() => {
    const totalEstimasi = activeShipments.reduce(
      (sum, s) => sum + (s.basePricePerKg || 0) * s.expectedWeight,
      0,
    );
    const nextPickup = activeShipments.find(
      (s) => s.pengirimanMethod === "PICKUP",
    );
    return [
      {
        title: "Pengiriman Aktif",
        value: `${activeShipments.length} Order`,
        iconSrc: "/icon/onProcess.png",
      },
      {
        title: "Estimasi Pencairan",
        value: formatRupiah(totalEstimasi),
        iconSrc: "/icon/shipmentConfirm.png",
      },
      {
        title: "Jadwal Pick-up",
        value: nextPickup ? formatDate(nextPickup.tanggalPanen) : "N/A",
        iconSrc: "/icon/truck.png",
      },
    ];
  }, [activeShipments]);

  const estimasiPendapatan = useMemo(() => {
    return (Number(jumlahPengiriman) || 0) * (Number(hargaDasar) || 0);
  }, [jumlahPengiriman, hargaDasar]);

  const handleCreateShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/app/pengiriman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          komoditasType: selectedBarang,
          beratKg: Number(jumlahPengiriman),
          hargaDasar: Number(hargaDasar),
          kopdesId: kopdesForm,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#606C38]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        Error: {error}. Coba refresh halaman.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]">
      {/* Logistik Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Logistik & Penyerahan Kargo
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            Setor barang dari gudang ke Kopdes dan pantau proses verifikasi QC
            untuk pencairan saldo.
          </p>
        </div>

        {/* Primary Action Button: + Buat Pengiriman (Triggers Modal) */}
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-5 shadow-none flex items-center gap-2 transition-colors shrink-0 w-fit"
        >
          <PlusCircle className="h-4 w-4" /> Buat Pengiriman
        </Button>
      </div>

      {/* StatCard Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        {shipmentStats.map((data, index) => (
          <Card
            key={index}
            className="bg-white border border-gray-200 rounded-2xl shadow-none hover:border-gray-300 transition-colors"
          >
            <CardContent className="px-4 sm:p-5 flex items-center gap-4">
              <div className="w-16 h-16 shrink-0 border border-gray-200 bg-gray-50/50 rounded-2xl flex items-center justify-center">
                <Image
                  src={data.iconSrc}
                  alt={data.title}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                  {data.title}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                  {data.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Active Orders Accordion & History Table */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
            <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#606C38]" />
                <CardTitle className="text-base font-bold text-gray-900">
                  Pengiriman Berjalan (Active Shipments)
                </CardTitle>
              </div>
              <Badge className="bg-[#606C38] text-white text-[10px] font-bold shadow-none">
                {activeShipments.length} Order Aktif
              </Badge>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {activeShipments.length > 0 ? (
                activeShipments.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const { currentStepIndex, statusLabel } = getStatusInfo(
                    order.status,
                  );

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all"
                    >
                      {/* Collapsed Accordion Header */}
                      <div
                        onClick={() =>
                          setExpandedOrderId((prev) =>
                            prev === order.id ? "" : order.id,
                          )
                        }
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[#606C38]/10 text-[#606C38] flex items-center justify-center font-mono font-bold text-xs">
                            {order.trackingCode?.split("-")[1]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#606C38]">
                                {order.trackingCode}
                              </span>
                              <span className="text-xs font-bold text-gray-900">
                                {order.kopdes?.name || "N/A"}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-gray-500">
                              {order.type} •{" "}
                              <span className="font-bold text-gray-700">
                                {order.expectedWeight} Kg
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="bg-[#606C38]/10 text-[#606C38] border-[#606C38]/20 text-[10px] font-bold"
                          >
                            {statusLabel}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Content: Strict 5-Stage Stepper & Handover Button */}
                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-gray-100 space-y-4 bg-gray-50/30">
                          {/* 5-Stage Stepper UI */}
                          <div className="pt-3 space-y-2">
                            <span className="text-xs font-bold text-gray-700">
                              Tahapan Progress Kargo:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
                              {STAGES.map((stg, sIdx) => {
                                const isPast = sIdx < currentStepIndex;
                                const isCurrent = sIdx === currentStepIndex;

                                return (
                                  <div
                                    key={sIdx}
                                    className={cn(
                                      "p-2.5 rounded-xl border text-xs flex flex-col justify-between space-y-1",
                                      isPast
                                        ? "bg-[#606C38]/10 border-[#606C38]/30 text-gray-900"
                                        : isCurrent
                                          ? "bg-white border-2 border-[#606C38] text-gray-900 font-bold"
                                          : "bg-white border-gray-200 text-gray-400",
                                    )}
                                  >
                                    <div className="flex items-center gap-1 font-bold">
                                      <CheckCircle2
                                        className={cn(
                                          "h-3.5 w-3.5 shrink-0",
                                          isPast || isCurrent
                                            ? "text-[#606C38]"
                                            : "text-gray-300",
                                        )}
                                      />
                                      <span className="text-[10px] leading-tight">
                                        {stg.name}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-200/60">
                            <div className="text-xs text-gray-600 font-medium space-y-0.5">
                              <p>
                                Driver:{" "}
                                <span className="font-bold text-gray-800">
                                  {order.driverName || "Belum ditugaskan"}
                                </span>
                              </p>
                              <p>
                                Estimasi Pendapatan:{" "}
                                <span className="font-extrabold text-[#606C38]">
                                  {formatRupiah(
                                    (order.basePricePerKg || 0) *
                                      order.expectedWeight,
                                  )}
                                </span>
                              </p>
                            </div>

                            {currentStepIndex === 0 ? (
                              <Button
                                size="sm"
                                onClick={() => setValidationModalData(order)}
                                className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-none flex items-center gap-2"
                              >
                                <QrCode className="h-4 w-4" /> Validasi
                                Penyerahan
                              </Button>
                            ) : (
                              <span className="text-[11px] font-bold text-gray-400 italic">
                                Penyerahan Divalidasi
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-xs text-gray-400 p-8">
                  Belum ada pengiriman aktif.
                </p>
              )}
            </CardContent>
          </Card>

          {/* RiwayatPengiriman Table */}
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-bold text-gray-900">
                Riwayat Pengiriman Selesai
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="border border-gray-200 rounded-xl overflow-x-auto">
                <Table className="w-full text-xs">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-bold text-gray-700">
                        ID Kargo
                      </TableHead>
                      <TableHead className="font-bold text-gray-700">
                        Tanggal
                      </TableHead>
                      <TableHead className="font-bold text-gray-700">
                        Tujuan Kopdes
                      </TableHead>
                      <TableHead className="font-bold text-gray-700">
                        Komoditas
                      </TableHead>
                      <TableHead className="font-bold text-gray-700">
                        Jumlah
                      </TableHead>
                      <TableHead className="font-bold text-gray-700">
                        Status QC
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyShipments.length > 0 ? (
                      historyShipments.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-mono font-bold text-[#606C38]">
                            {h.trackingCode}
                          </TableCell>
                          <TableCell>{formatDate(h.tanggalPanen)}</TableCell>
                          <TableCell className="font-bold">
                            {h.kopdes?.name}
                          </TableCell>
                          <TableCell>{h.type}</TableCell>
                          <TableCell className="font-bold">
                            {h.actualWeight || h.expectedWeight} Kg
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-[#606C38]/10 text-[#606C38] border-[#606C38]/20 font-bold text-[10px]"
                            >
                              QC PASS & CAIR
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-gray-400"
                        >
                          Belum ada riwayat.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section: PickupSchedule & Insight */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
            <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#606C38]" />
                <CardTitle className="text-base font-bold text-gray-900">
                  Jadwal Penjemputan Kopdes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="p-4 bg-[#FEFAE0]/30 rounded-xl border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    Selasa, 4 Agustus 2026
                  </span>
                  <Badge className="bg-[#606C38] text-white text-[10px] font-bold shadow-none">
                    09:00 WITA
                  </Badge>
                </div>
                <p className="text-xs font-medium text-gray-600">
                  Pick-up armada Kopdes Minahasa Pos 1 (Penyetoran 1.000 Kg
                  Kopra Putih).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
            <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#606C38]" />
                <CardTitle className="text-base font-bold text-gray-900">
                  AI Logistik Insight
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs font-medium text-gray-600">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <h4 className="font-bold text-gray-900">
                  Optimasi Rute Armada
                </h4>
                <p className="leading-relaxed">
                  Penjemputan bersama 4 petani se-desa mengurangi biaya
                  pengiriman hingga 18%.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- CREATE SHIPMENT DIALOG MODAL --- */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Buat Pengiriman Baru
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Pilih stok dari gudang dan tentukan harga dasar ke Kopdes.
            </DialogDescription>
          </DialogHeader>

          {createSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-[#606C38]/10 text-[#606C38] flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Pengiriman Berhasil Dijadwalkan!
              </h3>
              <p className="text-xs font-medium text-gray-500">
                Stok komoditas telah dialokasikan ke armada penjemputan Kopdes.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleCreateShipmentSubmit}
              className="space-y-4 py-2"
            >
              {/* 1. Pilih Barang dari Gudang */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">
                  Pilih Barang dari Gudang
                </Label>
                <Select
                  value={selectedBarang}
                  onValueChange={(value) => value && setSelectedBarang(value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-300 text-xs">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">
                  Jumlah Pengiriman (Kg / Liter)
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

              {/* 3. Crucial New Input: Harga Dasar ke Kopdes (Rp/Satuan) */}
              <div className="space-y-1.5">
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

              {/* Auto-Calc Text Block */}
              <div className="p-3.5 bg-[#FEFAE0]/40 border border border-gray-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  Kalkulasi Auto-System:
                </span>
                <p className="text-xs font-extrabold text-[#606C38] leading-relaxed">
                  Estimasi Pendapatan Awal: {formatRupiah(estimasiPendapatan)}{" "}
                  <span className="font-medium text-gray-600">
                    (Cair ke saldo setelah lolos QC Kopdes)
                  </span>
                </p>
              </div>

              {/* 4. Pos Kopdes Tujuan */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">
                  Pos Kopdes Tujuan
                </Label>
                <Select
                  value={kopdesForm}
                  onValueChange={(value) => value && setKopdesForm(value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-300 text-xs">
                    <SelectValue placeholder="Pilih Pos Kopdes" />
                  </SelectTrigger>
                  <SelectContent className="font-['Quicksand',sans-serif]">
                    {kopdesList.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Metode Pengiriman & Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Metode Pengiriman
                  </Label>
                  <Select
                    value={metodeForm}
                    onValueChange={(value) => {
                      if (value) setMetodeForm(value as PengirimanMethod);
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-gray-300 text-xs">
                      <SelectValue placeholder="Metode" />
                    </SelectTrigger>
                    <SelectContent className="font-['Quicksand',sans-serif]">
                      <SelectItem value="PICKUP">
                        Penjemputan Armada Kopdes
                      </SelectItem>
                      <SelectItem value="SELF_DELIVERY">
                        Setor Mandiri (Antar Sendiri)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Tanggal
                  </Label>
                  <Input
                    type="date"
                    value={tanggalForm}
                    onChange={(e) => setTanggalForm(e.target.value)}
                    className="h-11 rounded-xl border-gray-300 text-xs"
                    required
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold rounded-xl shadow-none flex items-center justify-center gap-2"
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

      {/* --- HANDOVER VALIDATION MODAL (QR & 6-DIGIT PIN) --- */}
      <Dialog
        open={!!validationModalData}
        onOpenChange={() => setValidationModalData(null)}
      >
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif] text-center">
          <DialogHeader>
            <div className="flex items-center justify-center gap-2 text-[#606C38] pb-1">
              <ShieldCheck className="h-6 w-6" />
              <DialogTitle className="text-xl font-bold text-gray-900">
                Validasi Serah-Terima Barang
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Tunjukkan QR atau kode PIN ini kepada petugas Kopdes untuk
              memvalidasi serah-terima barang.
            </DialogDescription>
          </DialogHeader>

          {validationModalData && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center space-y-2">
                <div className="h-44 w-44 bg-white border-2 border-[#606C38] rounded-xl flex flex-col items-center justify-center space-y-1 p-2">
                  <QrCode className="h-28 w-28 text-[#606C38]" />
                  <span className="text-[10px] font-mono font-bold text-gray-600">
                    {validationModalData.qrCodePass}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-gray-500">
                  Pindai QR Kode oleh Petugas
                </span>
              </div>

              <div className="p-4 bg-[#FEFAE0]/40 border border-gray-200 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-gray-600 flex items-center justify-center gap-1">
                  <KeyRound className="h-3.5 w-3.5 text-[#606C38]" /> Kode PIN
                  Manual Fallback
                </span>
                <div className="text-3xl font-extrabold text-[#606C38] tracking-widest font-mono">
                  {validationModalData.handoverPin}
                </div>
                <p className="text-[10px] font-medium text-gray-500">
                  Gunakan kode PIN 6 angka ini jika kamera pemindai terhambat.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setValidationModalData(null)}
              className="w-full bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-11 rounded-xl shadow-none"
            >
              Selesai Validasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
