"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Store,
  PlusCircle,
  Users,
  ChevronRight,
  Loader2,
  Package,
  MapPin,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface WtbItem {
  id: string;
  perusahaanId: string;
  komoditas: string;
  spesifikasi?: string | null;
  targetWeight: number;
  maxPrice: number;
  destination: string;
  deadline?: string | null;
  status: "OPEN" | "DEAL" | "COMPLETED" | "CANCELLED";
  dealPrice?: number | null;
  createdAt: string;
  collectedWeight: number;
  kopdesJoined: number;
  perusahaan?: {
    name?: string | null;
  };
  _count?: {
    negosiasi: number;
    batches: number;
  };
}

export default function PerusahaanMainDashboard() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<WtbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [spesifikasi, setSpesifikasi] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [destination, setDestination] = useState("");
  const [deadline, setDeadline] = useState("");
  const [kategori, setKategori] = useState("Produk Primer");
  const [jenisProduk, setJenisProduk] = useState("Kelapa Utuh");

  // fetch data wtb asli dari db
  const fetchRequests = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/wtb?perusahaanId=${session.user.id}`);
      const json = await res.json();
      if (res.ok) {
        setRequests(json.data || []);
      } else {
        toast.error(json.error || "Gagal mengambil data WTB.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchRequests();
    }
  }, [session?.user?.id]);

  // submit form wtb ke db
  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("Autentikasi diperlukan.");
      return;
    }
    if (!targetWeight || !maxPrice || !destination) {
      toast.error("Mohon lengkapi semua field yang wajib.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/wtb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perusahaanId: session.user.id,
          komoditas: jenisProduk,
          spesifikasi: spesifikasi || undefined,
          targetWeight: Number(targetWeight),
          maxPrice: Number(maxPrice),
          destination,
          deadline: deadline || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Purchase Request berhasil dipublikasikan!");
        setIsOpenForm(false);
        setTargetWeight("");
        setMaxPrice("");
        setDestination("");
        setSpesifikasi("");
        setDeadline("");
        fetchRequests();
      } else {
        toast.error(json.error || "Gagal membuat Purchase Request.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat memproses data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ngitung total pasokan dari batch & ringkasan metrik
  const activeCount = requests.filter(
    (r) => r.status === "OPEN" || r.status === "DEAL",
  ).length;
  const totalPasokanKg = requests.reduce(
    (sum, r) => sum + (r.collectedWeight || 0),
    0,
  );
  const totalNilaiKontrak = requests.reduce(
    (sum, r) => sum + (r.targetWeight || 0) * (r.dealPrice || r.maxPrice || 0),
    0,
  );

  const getJenisOptions = () => {
    if (kategori === "Produk Primer") {
      return ["Kelapa Utuh", "Kopra Putih", "Kelapa Kupas"];
    }
    if (kategori === "Produk Olahan") {
      return [
        "Minyak Kelapa",
        "Minyak Kelapa Murni (VCO)",
        "Briket Tempurung",
        "Arang Kelapa",
      ];
    }
    return ["Tempurung Kelapa", "Sabut Kelapa", "Air Kelapa"];
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#606C38] text-white flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              B2B Marketplace & Purchase Requests
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            Buat permintaan pembelian crowd supplying dan himpun pasokan dari
            puluhan Kopdes.
          </p>
        </div>

        {/* Modal Form Purchase Request */}
        <Dialog open={isOpenForm} onOpenChange={setIsOpenForm}>
          <DialogTrigger
            render={
              <Button className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-4 shadow-none flex items-center gap-2 transition-colors shrink-0" />
            }
          >
            <PlusCircle className="h-4 w-4" /> Buat Purchase Request Baru
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Form Permintaan Pembelian
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500">
                Tentukan komoditas, volume tonase, dan harga penawaran ke
                jaringan Kopdes.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreatePR} className="space-y-4 py-2">
              <div className="flex flex-row items-center gap-4 w-full">
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs font-bold text-gray-700">
                    Kategori Produk *
                  </Label>
                  <Select
                    value={kategori}
                    onValueChange={(val) => {
                      if (!val) return;
                      setKategori(val);
                      const opts =
                        val === "Produk Primer"
                          ? "Kelapa Utuh"
                          : val === "Produk Olahan"
                            ? "Minyak Kelapa"
                            : "Tempurung Kelapa";
                      setJenisProduk(opts);
                    }}
                  >
                    <SelectTrigger className="w-full h-11 rounded-xl border-gray-300 text-xs">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="font-['Quicksand',sans-serif]">
                      <SelectItem value="Produk Primer">
                        Produk Primer
                      </SelectItem>
                      <SelectItem value="Produk Olahan">
                        Produk Olahan
                      </SelectItem>
                      <SelectItem value="Produk Sampingan">
                        Produk Sampingan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs font-bold text-gray-700">
                    Jenis Produk *
                  </Label>
                  <Select
                    value={jenisProduk}
                    onValueChange={(val) => val && setJenisProduk(val)}
                  >
                    <SelectTrigger className="w-full h-11 rounded-xl border-gray-300 text-xs">
                      <SelectValue placeholder="Jenis Produk" />
                    </SelectTrigger>
                    <SelectContent className="font-['Quicksand',sans-serif]">
                      {getJenisOptions().map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Jumlah Kebutuhan (Kg) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="Contoh: 10000"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Harga Penawaran (Rp / Kg) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="Contoh: 11500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Tujuan Pengiriman *
                  </Label>
                  <Input
                    placeholder="Gudang Surabaya / Pelabuhan Bitung"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Batas Pengumpulan (Deadline)
                  </Label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">
                  Catatan Spesifikasi Mutu & Syarat QC
                </Label>
                <Textarea
                  placeholder="Deskripsikan toleransi kadar air, kemasan, atau ketentuan penyortiran..."
                  value={spesifikasi}
                  onChange={(e) => setSpesifikasi(e.target.value)}
                  className="rounded-xl text-xs min-h-[70px]"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-11 rounded-xl shadow-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Publikasikan Purchase Request"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-1">
          <span className="text-xs font-bold text-gray-500">
            Total Purchase Request Active
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {activeCount} Kontrak PR
          </h2>
          <p className="text-[11px] font-medium text-[#606C38]">
            Crowd Supplying Open / Deal
          </p>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-1">
          <span className="text-xs font-bold text-gray-500">
            Total Pasokan Terhimpun
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {totalPasokanKg.toLocaleString("id-ID")} Kg
          </h2>
          <p className="text-[11px] font-medium text-gray-500">
            Dari Koperasi Desa Terhubung
          </p>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 space-y-1">
          <span className="text-xs font-bold text-gray-500">
            Estimasi Nilai Kontrak
          </span>
          <h2 className="text-2xl font-extrabold text-[#606C38]">
            Rp {totalNilaiKontrak.toLocaleString("id-ID")}
          </h2>
          <p className="text-[11px] font-medium text-gray-500">
            Pembayaran Kopdes
          </p>
        </Card>
      </div>

      {/* Purchase Request Active Lists */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
        <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Daftar Permintaan Pembelian Aktif
            </CardTitle>
            <p className="text-xs font-medium text-gray-500">
              Progres himpunan kuota crowd supplying dari jaringan kelompok tani
              & Kopdes.
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12 text-gray-500 text-xs font-semibold">
              <Loader2 className="h-6 w-6 animate-spin text-[#606C38] mr-2" />
              Memuat data Purchase Requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl space-y-3">
              <Package className="mx-auto h-10 w-10 text-gray-400" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900">
                  Belum Ada Purchase Request
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Belum ada Purchase Request aktif. Klik "Buat Purchase Request
                  Baru" untuk mempublikasikan permintaan pasokan ke Kopdes.
                </p>
              </div>
            </div>
          ) : (
            requests.map((pr) => {
              const collected = pr.collectedWeight || 0;
              const target = pr.targetWeight || 1;
              const percent = Math.min(
                100,
                Math.round((collected / target) * 100),
              );

              const formattedDeadline = pr.deadline
                ? new Date(pr.deadline).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Tanpa Batas";

              return (
                <div
                  key={pr.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-[#606C38] transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#606C38]">
                          {pr.id.slice(0, 8).toUpperCase()}
                        </span>
                        <h3 className="text-base font-bold text-gray-900">
                          {pr.komoditas}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500 mt-1">
                        <span>
                          Batas Pengumpulan:{" "}
                          <span className="font-bold text-gray-700">
                            {formattedDeadline}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          {pr.destination}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-[#606C38]/10 text-[#606C38] border-[#606C38]/20 font-bold text-xs"
                      >
                        Rp{" "}
                        {(pr.dealPrice || pr.maxPrice).toLocaleString("id-ID")}{" "}
                        / Kg
                      </Badge>
                      <Badge
                        className={
                          pr.status === "COMPLETED"
                            ? "bg-emerald-600 text-white"
                            : pr.status === "DEAL"
                              ? "bg-blue-600 text-white"
                              : pr.status === "CANCELLED"
                                ? "bg-rose-600 text-white"
                                : "bg-[#606C38] text-white"
                        }
                      >
                        {pr.status === "COMPLETED"
                          ? "TERPENUHI"
                          : pr.status === "DEAL"
                            ? "DEAL NEGOTIATED"
                            : pr.status === "CANCELLED"
                              ? "DIBATALKAN"
                              : "CROWD SUPPLYING"}
                      </Badge>
                    </div>
                  </div>

                  {pr.spesifikasi && (
                    <p className="text-xs font-medium text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <span className="font-bold text-gray-800">
                        Spesifikasi Mutu:{" "}
                      </span>
                      {pr.spesifikasi}
                    </p>
                  )}

                  {/* Progress Bar & Metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-700">
                        Terhimpun: {collected.toLocaleString("id-ID")} Kg /{" "}
                        {target.toLocaleString("id-ID")} Kg Target
                      </span>
                      <span className="text-[#606C38]">{percent}% Progres</span>
                    </div>
                    <Progress value={percent} className="h-2.5 bg-gray-100" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs font-medium text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#606C38]" />
                      <span>
                        {pr.kopdesJoined || 0} Koperasi Desa Bergabung (
                        {pr._count?.negosiasi || 0} Penawaran Negosiasi)
                      </span>
                    </div>
                    <Link
                      href="/perusahaan/negosiasi"
                      className="inline-flex items-center gap-1 font-bold text-[#606C38] hover:underline"
                    >
                      Lihat Negosiasi & Penawaran Kopdes{" "}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
