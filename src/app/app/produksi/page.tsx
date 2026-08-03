"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  Warehouse,
  Factory,
  Recycle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  MinusCircle,
  CheckCircle2,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  FarmerInventory,
  InventoryMutation,
  InventoryMutationReason,
} from "@prisma/client";

const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function GudangInventoriPage() {
  const [stocks, setStocks] = useState<FarmerInventory[]>([]);
  const [mutations, setMutations] = useState<InventoryMutation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for "- Kurangi Stok"
  const [isDeductModalOpen, setIsDeductModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("diolah");
  const [deductSuccess, setDeductSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab 1: Diolah Form State
  const [bahanBaku, setBahanBaku] = useState("");
  const [jumlahBahan, setJumlahBahan] = useState<number | string>("");
  const [hasilOlahan, setHasilOlahan] = useState("Kopra Putih");
  const [jumlahHasil, setJumlahHasil] = useState<number | string>("");

  // Tab 2: Konsumsi Form State
  const [komoditasKonsumsi, setKomoditasKonsumsi] = useState("");
  const [jumlahKonsumsi, setJumlahKonsumsi] = useState<number | string>("");

  // Tab 3: Susut Form State
  const [komoditasSusut, setKomoditasSusut] = useState("");
  const [jumlahSusut, setJumlahSusut] = useState<number | string>("");

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/app/inventori");
      if (!res.ok) throw new Error("Gagal mengambil data inventori");
      const data = await res.json();
      setStocks(data.stocks || []);
      setMutations(data.mutations || []);

      // auto-select
      if (data.stocks && data.stocks.length > 0) {
        setBahanBaku(data.stocks[0].jenisProduk);
        setKomoditasKonsumsi(data.stocks[0].jenisProduk);
        setKomoditasSusut(data.stocks[0].jenisProduk);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const { stokPrimer, stokOlahan, stokSampingan } = useMemo(() => {
    return stocks.reduce(
      (acc, stock) => {
        if (stock.kategori === "PRODUK_PRIMER") acc.stokPrimer.push(stock);
        else if (stock.kategori === "PRODUK_OLAHAN") acc.stokOlahan.push(stock);
        else if (stock.kategori === "PRODUK_SAMPINGAN")
          acc.stokSampingan.push(stock);
        return acc;
      },
      { stokPrimer: [], stokOlahan: [], stokSampingan: [] } as Record<
        string,
        FarmerInventory[]
      >,
    );
  }, [stocks]);

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let url = "";
    let payload = {};

    try {
      if (activeTab === "diolah") {
        url = "/api/app/inventori/olah";
        payload = {
          bahanBaku,
          jumlahBahan: Number(jumlahBahan),
          hasilOlahan,
          jumlahHasil: Number(jumlahHasil),
        };
      } else {
        url = "/api/app/inventori/kurangi";
        if (activeTab === "konsumsi") {
          payload = {
            alasan: InventoryMutationReason.KONSUMSI_PRIBADI,
            komoditas: komoditasKonsumsi,
            jumlah: Number(jumlahKonsumsi),
            satuan:
              stocks.find((s) => s.jenisProduk === komoditasKonsumsi)?.satuan ||
              "Kg",
          };
        } else {
          // susut
          payload = {
            alasan: InventoryMutationReason.RUSAK_SUSUT,
            komoditas: komoditasSusut,
            jumlah: Number(jumlahSusut),
            satuan:
              stocks.find((s) => s.jenisProduk === komoditasSusut)?.satuan ||
              "Kg",
          };
        }
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Gagal memproses transaksi`);
      }

      setDeductSuccess(true);
      await fetchInventory(); // refresh data
      setTimeout(() => {
        setIsDeductModalOpen(false);
        setDeductSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Manajemen Stok dan Produksi
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            Rincian stok fisik komoditas kelapa yang tersimpan di kebun Anda.
          </p>
        </div>

        {/* Action Button: - Kurangi Stok (Matched with Lahan Page button styling) */}
        <Button
          onClick={() => setIsDeductModalOpen(true)}
          className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-4 shadow-none flex items-center gap-2 transition-colors shrink-0"
        >
          <MinusCircle className="h-4 w-4" /> Kurangi Stok
        </Button>
      </div>

      {/* TOP SECTION: PAPAN STOK GUDANG (3 Cards Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Produk Primer */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
          <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#606C38]/10 text-[#606C38] flex items-center justify-center">
                <Package className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold text-gray-900">
                Produk Primer
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {stokPrimer.length > 0 ? (
              stokPrimer.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-800 block">
                      {item.jenisProduk}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Stok Utama
                    </span>
                  </div>
                  <span className="font-extrabold text-sm text-[#606C38]">
                    {item.jumlah} {item.satuan}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-center text-gray-400 p-4">
                Belum ada stok.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Produk Olahan */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
          <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#DDA15E]/20 text-[#BC6C25] flex items-center justify-center">
                <Factory className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold text-gray-900">
                Produk Olahan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {stokOlahan.length > 0 ? (
              stokOlahan.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-800 block">
                      {item.jenisProduk}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Stok Olahan
                    </span>
                  </div>
                  <span className="font-extrabold text-sm text-[#BC6C25]">
                    {item.jumlah} {item.satuan}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-center text-gray-400 p-4">
                Belum ada stok.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Produk Sampingan */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
          <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#283618]/10 text-[#283618] flex items-center justify-center">
                <Recycle className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold text-gray-900">
                Produk Sampingan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {stokSampingan.length > 0 ? (
              stokSampingan.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-800 block">
                      {item.jenisProduk}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Stok Sampingan
                    </span>
                  </div>
                  <span className="font-extrabold text-sm text-gray-900">
                    {item.jumlah} {item.satuan}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-center text-gray-400 p-4">
                Belum ada stok.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MIDDLE SECTION: AI Business Advisor Card (PRESERVED) */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
        <CardContent className="p-4 sm:p-5 flex items-start sm:items-center gap-3 bg-[#FEFAE0]/30 border border-gray-200/80 rounded-2xl">
          <div className="h-10 w-10 rounded-xl bg-[#606C38] text-white flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <span>Rekomendasi AI Business Advisor</span>
              <Badge className="bg-[#606C38] text-white text-[9px] font-extrabold">
                PASAR HARI INI
              </Badge>
            </h4>
            <p className="text-xs font-medium text-gray-700 leading-relaxed">
              💡 Rekomendasi AI: Harga Tempurung Kelapa sedang naik 15%.
              Pisahkan dan simpan tempurung saat mengolah kopra untuk ekstra
              profit minggu ini.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* BOTTOM SECTION: Buku Transaksi Inventori Table (PRESERVED) */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-900">
            Buku Transaksi Inventori
          </CardTitle>
          <p className="text-xs font-medium text-gray-500">
            Histori mutasi masuk dan keluar stok fisik komoditas gudang.
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="border border-gray-200 rounded-xl overflow-x-auto">
            <Table className="w-full text-xs">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-bold text-gray-700">
                    Tanggal
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Komoditas
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Tipe Mutasi
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Jumlah
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Keterangan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mutations.length > 0 ? (
                  mutations.map((item, idx) => (
                    <TableRow
                      key={item.id}
                      className={`border-b border-gray-100 ${idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}
                    >
                      <TableCell className="font-bold text-gray-900 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-800">
                        {item.komoditas}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.tipe === "MASUK"
                              ? "bg-[#606C38]/10 text-[#606C38] border-[#606C38]/20 font-bold"
                              : "bg-amber-50 text-amber-700 border-amber-200 font-bold"
                          }
                        >
                          {item.tipe === "MASUK" ? (
                            <ArrowUpRight className="h-3 w-3 mr-0.5 inline" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-0.5 inline" />
                          )}
                          {item.tipe}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`font-extrabold ${item.tipe === "MASUK" ? "text-[#606C38]" : "text-amber-700"}`}
                      >
                        {item.tipe === "MASUK" ? "+" : "-"}
                        {item.jumlah} {item.satuan}
                      </TableCell>
                      <TableCell className="text-gray-500 font-medium">
                        {item.keterangan}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-400"
                    >
                      Belum ada transaksi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- DIALOG MODAL: KURANGI STOK WITH SHADCN TABS (Matched with Lahan Page Container Style) --- */}
      <Dialog
        open={isDeductModalOpen}
        onOpenChange={(isOpen) => {
          setIsDeductModalOpen(isOpen);
          if (!isOpen) setDeductSuccess(false);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MinusCircle className="h-5 w-5 text-[#606C38]" />
              Kurangi Stok (Pakai / Olah)
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Catat pengeluaran stok untuk pengolahan manual, konsumsi, atau
              penyusutan.
            </DialogDescription>
          </DialogHeader>

          {deductSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-[#606C38]/10 text-[#606C38] flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Transaksi Berhasil Disimpan!
              </h3>
              <p className="text-xs font-medium text-gray-500">
                Mutasi pengeluaran stok telah tercatat di Buku Transaksi
                Inventori.
              </p>
            </div>
          ) : (
            <form onSubmit={handleTransactionSubmit} className="space-y-4 py-1">
              {/* Shadcn Tabs UI with 3 triggers: Diolah, Konsumsi, Rusak/Susut */}
              <Tabs
                defaultValue="diolah"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3 bg-gray-100 p-1 rounded-xl font-bold text-xs">
                  <TabsTrigger
                    value="diolah"
                    className="rounded-lg text-xs py-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#606C38]"
                  >
                    Diolah
                  </TabsTrigger>
                  <TabsTrigger
                    value="konsumsi"
                    className="rounded-lg text-xs py-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#606C38]"
                  >
                    Konsumsi
                  </TabsTrigger>
                  <TabsTrigger
                    value="susut"
                    className="rounded-lg text-xs py-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#606C38]"
                  >
                    Rusak/Susut
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: "Diolah" (Konversi/Transformasi Dual-Input Form) */}
                <TabsContent value="diolah" className="pt-3 space-y-3">
                  {/* Section A: Bahan Baku */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <span className="text-[10px] font-extrabold text-[#606C38] uppercase">
                      Bahan Baku (Dikurangi)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-gray-700">
                          Pilih Bahan Baku
                        </Label>
                        <Select
                          value={bahanBaku}
                          onValueChange={(value) => setBahanBaku(value ?? "")}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-gray-300 text-xs">
                            <SelectValue placeholder="Bahan Baku" />
                          </SelectTrigger>
                          <SelectContent className="font-['Quicksand',sans-serif]">
                            {stocks.map((s) => (
                              <SelectItem key={s.id} value={s.jenisProduk}>
                                {s.jenisProduk} ({s.jumlah} {s.satuan})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-gray-700">
                          Jumlah Dipakai
                        </Label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={jumlahBahan}
                          onChange={(e) => setJumlahBahan(e.target.value)}
                          className="h-10 rounded-xl border-gray-300 text-xs font-bold"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visual Separator */}
                  <div className="flex items-center justify-center py-0.5">
                    <div className="h-6 w-6 rounded-full bg-gray-100 text-[#606C38] flex items-center justify-center border border-gray-200">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Section B: Hasil Olahan */}
                  <div className="p-3 bg-[#FEFAE0]/40 rounded-xl border border-gray-200/80 space-y-2">
                    <span className="text-[10px] font-extrabold text-[#BC6C25] uppercase">
                      Hasil Olahan (Bertambah)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-gray-700">
                          Hasil Olahan
                        </Label>
                        <Select
                          value={hasilOlahan}
                          onValueChange={(value) => setHasilOlahan(value ?? "")}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-gray-300 text-xs">
                            <SelectValue placeholder="Hasil Olahan" />
                          </SelectTrigger>
                          <SelectContent className="font-['Quicksand',sans-serif]">
                            <SelectItem value="Kopra Putih">
                              Kopra Putih
                            </SelectItem>
                            <SelectItem value="Minyak Kelapa">
                              Minyak Kelapa
                            </SelectItem>
                            <SelectItem value="VCO">
                              VCO (Virgin Coconut Oil)
                            </SelectItem>
                            <SelectItem value="Briket Tempurung">
                              Briket Tempurung
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-gray-700">
                          Jumlah Dihasilkan
                        </Label>
                        <Input
                          type="number"
                          placeholder="60"
                          value={jumlahHasil}
                          onChange={(e) => setJumlahHasil(e.target.value)}
                          className="h-10 rounded-xl border-gray-300 text-xs font-bold"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: "Konsumsi" (Single-Input Form) */}
                <TabsContent value="konsumsi" className="pt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Pilih Komoditas
                    </Label>
                    <Select
                      value={komoditasKonsumsi}
                      onValueChange={(value) =>
                        setKomoditasKonsumsi(value ?? "")
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl border-gray-300 text-xs">
                        <SelectValue placeholder="Pilih Komoditas" />
                      </SelectTrigger>
                      <SelectContent className="font-['Quicksand',sans-serif]">
                        {stocks.map((s) => (
                          <SelectItem key={s.id} value={s.jenisProduk}>
                            {s.jenisProduk} ({s.jumlah} {s.satuan})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Jumlah Dikurangi (Kg/Liter)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Contoh: 10"
                      value={jumlahKonsumsi}
                      onChange={(e) => setJumlahKonsumsi(e.target.value)}
                      className="h-11 rounded-xl border-gray-300 text-xs font-bold"
                      required
                    />
                  </div>
                </TabsContent>

                {/* Tab 3: "Rusak/Susut" (Single-Input Form) */}
                <TabsContent value="susut" className="pt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Pilih Komoditas
                    </Label>
                    <Select
                      value={komoditasSusut}
                      onValueChange={(value) => setKomoditasSusut(value ?? "")}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-gray-300 text-xs">
                        <SelectValue placeholder="Pilih Komoditas" />
                      </SelectTrigger>
                      <SelectContent className="font-['Quicksand',sans-serif]">
                        {stocks.map((s) => (
                          <SelectItem key={s.id} value={s.jenisProduk}>
                            {s.jenisProduk} ({s.jumlah} {s.satuan})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Jumlah Rusak/Susut (Kg/Liter)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Contoh: 5"
                      value={jumlahSusut}
                      onChange={(e) => setJumlahSusut(e.target.value)}
                      className="h-11 rounded-xl border-gray-300 text-xs font-bold"
                      required
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Submit Action Button: Simpan Transaksi (Matched with Lahan Page submit style) */}
              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-11 rounded-xl shadow-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Simpan Transaksi"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
