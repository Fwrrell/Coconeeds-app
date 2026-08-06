"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Sprout,
  Trees,
  Droplets,
  Calendar,
  Plus,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Edit,
  Trash2,
  Info,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
type Lahan = any; // type inline smntara biar ga error di browser

// --- HELPER UNTUK FORMAT TANGGAL ---
const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function LahanPage() {
  const [lahanList, setLahanList] = useState<Lahan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLahan, setSelectedLahan] = useState<Lahan | null>(null);

  // Form state
  const [namaLahan, setNamaLahan] = useState("");
  const [luasLahan, setLuasLahan] = useState("");
  const [pohonLahan, setPohonLahan] = useState("");
  const [lokasiLahan, setLokasiLahan] = useState("");
  const [deskripsiLahan, setDeskripsiLahan] = useState("");
  const [tanggalTanam, setTanggalTanam] = useState("");

  // fetch data lahan
  const fetchLahan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/app/lahan");
      if (!response.ok) {
        throw new Error("Gagal mengambil data lahan");
      }
      const data = await response.json();
      setLahanList(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLahan();
  }, [fetchLahan]);

  // kalkulasi statistik dari data
  const lahanStats = useMemo(() => {
    const totalLuas = lahanList.reduce((sum, lahan) => sum + lahan.luasM2, 0);
    const totalPohon = lahanList.reduce(
      (sum, lahan) => sum + lahan.jumlahPohon,
      0,
    );
    const totalLuasHa = (totalLuas / 10000).toFixed(1);

    // cari estimasi panen terdekat
    const upcomingHarvest = lahanList
      .filter((l) => l.waktuPanenEstimate)
      .sort(
        (a, b) =>
          new Date(a.waktuPanenEstimate!).getTime() -
          new Date(b.waktuPanenEstimate!).getTime(),
      )[0];

    let harvestText = "N/A";
    if (upcomingHarvest && upcomingHarvest.waktuPanenEstimate) {
      const diffDays = Math.ceil(
        (new Date(upcomingHarvest.waktuPanenEstimate).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      harvestText = `${diffDays} hari lagi`;
    }

    return [
      {
        text: "Luas Lahan",
        stat: `${totalLuasHa} Ha`,
        iconSrc: "/icon/mapPin.png",
        // sembunyiin link ai-insight dlu biar ga 404
        link: "#",
      },
      {
        text: "Pohon Kelapa",
        stat: `${totalPohon} pohon`,
        iconSrc: "/icon/landCond.png",
        link: "#",
      },
      {
        text: "Akan Panen",
        stat: harvestText,
        subtitle: upcomingHarvest
          ? formatDate(upcomingHarvest.waktuPanenEstimate)
          : "Belum ada estimasi",
        iconSrc: "/icon/dataPanen.png",
        link: "#",
      },
      {
        text: "Lahan Terdaftar",
        stat: `${lahanList.length} Plot`,
        subtitle: "Lahan terverifikasi",
        iconSrc: "/icon/coconut.png",
        link: "#",
      },
    ];
  }, [lahanList]);

  const resetForm = () => {
    setNamaLahan("");
    setLuasLahan("");
    setPohonLahan("");
    setLokasiLahan("");
    setDeskripsiLahan("");
    setTanggalTanam("");
  };

  const handleAddLahan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/app/lahan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLahan: namaLahan,
          luasM2: Number(luasLahan),
          jumlahPohon: Number(pohonLahan),
          lokasiAddress: lokasiLahan,
          deskripsi: deskripsiLahan,
          tanggalTanam: tanggalTanam,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal menambahkan lahan");
      }

      await fetchLahan(); // refresh list
      resetForm();
      setIsOpenAdd(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenEditDialog = (lahan: Lahan) => {
    setSelectedLahan(lahan);
    setNamaLahan(lahan.namaLahan);
    setLuasLahan(String(lahan.luasM2));
    setPohonLahan(String(lahan.jumlahPohon));
    setLokasiLahan(lahan.lokasiAddress);
    setDeskripsiLahan(lahan.deskripsi || "");
    setTanggalTanam(
      lahan.tanggalTanam
        ? new Date(lahan.tanggalTanam).toISOString().split("T")[0]
        : "",
    );
    setIsEditOpen(true);
  };

  const handleEditLahan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLahan) return;

    try {
      const response = await fetch(`/api/app/lahan/${selectedLahan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLahan: namaLahan,
          luasM2: Number(luasLahan),
          jumlahPohon: Number(pohonLahan),
          lokasiAddress: lokasiLahan,
          deskripsi: deskripsiLahan,
          tanggalTanam: tanggalTanam,
        }),
      });

      if (!response.ok) throw new Error("Gagal mengupdate lahan");

      await fetchLahan();
      setIsEditOpen(false);
      setSelectedLahan(null);
      resetForm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteLahan = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus lahan ini?")) return;

    try {
      const response = await fetch(`/api/app/lahan/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Gagal menghapus lahan");

      // optimis update
      setLahanList((prev) => prev.filter((l) => l.id !== id));
      setSelectedLahan(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#606C38]" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        Error: {error}. Coba refresh halaman.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Daftar Lahan Kelapa
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            Kelola dan pantau kondisi lahan milikmu
          </p>
        </div>

        {/* FormLahan Modal Dialog */}
        <Dialog
          open={isOpenAdd}
          onOpenChange={(isOpen) => {
            setIsOpenAdd(isOpen);
            if (!isOpen) resetForm();
          }}
        >
          <Button
            onClick={() => {
              setIsOpenAdd(true);
              setSelectedLahan(null);
            }}
            className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-4 shadow-none flex items-center gap-2 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" /> Tambah Lahan Baru
          </Button>
          <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Form Tambah Kebun Lahan
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500">
                Daftarkan plot lahan kelapa baru untuk pemantauan AI
                Forecasting.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLahan} className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">
                  Nama Kebun / Blok
                </Label>
                <Input
                  placeholder="Contoh: Kebun Blok C Selatan"
                  value={namaLahan}
                  onChange={(e) => setNamaLahan(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-700">
                    Luas (Meter persegi)
                  </Label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={luasLahan}
                    onChange={(e) => setLuasLahan(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-700">
                    Jumlah Pohon
                  </Label>
                  <Input
                    type="number"
                    placeholder="300"
                    value={pohonLahan}
                    onChange={(e) => setPohonLahan(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">
                  Lokasi Kebun
                </Label>
                <Input
                  placeholder="Kecamatan / Desa"
                  value={lokasiLahan}
                  onChange={(e) => setLokasiLahan(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">
                  Deskripsi (Opsional)
                </Label>
                <Input
                  placeholder="misal: Lahan di dekat sungai"
                  value={deskripsiLahan}
                  onChange={(e) => setDeskripsiLahan(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">
                  Tanggal Tanam (Opsional)
                </Label>
                <Input
                  type="date"
                  value={tanggalTanam}
                  onChange={(e) => setTanggalTanam(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-11 rounded-xl shadow-none"
                >
                  Simpan Kebun Lahan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat Lahan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        {lahanStats.map((data, index) => (
          <Card
            key={index}
            className="bg-white border border-gray-200 rounded-2xl shadow-none hover:border-gray-300 transition-colors"
          >
            <CardContent className="px-4 sm:px-5 flex items-center gap-4">
              <div className="w-16 h-16 shrink-0 border border-gray-200 bg-gray-50/50 rounded-2xl flex items-center justify-center">
                <Image
                  src={data.iconSrc}
                  alt={data.text}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                  {data.text}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                  {data.stat}
                </h3>
                {data.subtitle && (
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                    {data.subtitle}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Land Plot List Section */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
        <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Daftar Lahan Terdaftar
            </CardTitle>
            <p className="text-xs font-medium text-gray-500">
              Klik pada kartu lahan untuk membuka rincian lengkap dan opsi aksi.
            </p>
          </div>
          <Badge className="bg-[#606C38] text-white text-[10px] font-bold shadow-none">
            {lahanList.length} Lahan Aktif
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {lahanList.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedLahan(item)}
              className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-[#606C38] hover:bg-gray-50/50 cursor-pointer transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">
                      {item.namaLahan}
                    </h3>
                    <Badge className="bg-[#606C38] text-white text-[10px] font-bold shadow-none">
                      {item.status || "PRODUKTIF"}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-[#606C38]" />{" "}
                    {item.lokasiAddress}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <span>Luas: {item.luasM2} m²</span>
                    <span>Pohon: {item.jumlahPohon} Pohon</span>
                  </div>
                </div>
              </div>

              {/* Kondisi Lahan Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Tanggal Tanam
                  </span>
                  <p className="font-bold text-gray-800">
                    {formatDate(item.tanggalTanam)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Pupuk
                  </span>
                  <p className="font-bold text-gray-800">
                    {item.pupuk || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Total Panen
                  </span>
                  <p className="font-bold text-gray-800">N/A</p>
                </div>
                <div className="p-3 bg-[#FEFAE0]/30 rounded-xl border border-gray-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-[#BC6C25] uppercase">
                    Estimasi Panen
                  </span>
                  <p className="font-bold text-[#606C38]">
                    {formatDate(item.waktuPanenEstimate)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* --- "DETAIL LAHAN" DIALOG MODAL --- */}
      <Dialog
        open={!!selectedLahan && !isEditOpen}
        onOpenChange={() => setSelectedLahan(null)}
      >
        <DialogContent className="sm:max-w-lg bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#606C38]/10 text-[#606C38] flex items-center justify-center">
                <Info className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Detail Lahan Kebun
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs font-medium text-gray-500 pt-1">
              Rincian komprehensif data plot kebun kelapa dan opsi tindakan
              pengeditan.
            </DialogDescription>
          </DialogHeader>

          {selectedLahan && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">
                    {selectedLahan.namaLahan}
                  </h3>
                  <Badge className="bg-[#606C38] text-white text-[10px] font-bold">
                    {selectedLahan.status}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#606C38]" />{" "}
                  {selectedLahan.lokasiAddress}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed pt-1">
                  {selectedLahan.deskripsi}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 border border-gray-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Luas Lahan
                  </span>
                  <p className="text-sm font-extrabold text-gray-900">
                    {selectedLahan.luasM2} m²
                  </p>
                </div>
                <div className="p-3 border border-gray-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Jumlah Pohon
                  </span>
                  <p className="text-sm font-extrabold text-gray-900">
                    {selectedLahan.jumlahPohon} Pohon
                  </p>
                </div>
                <div className="p-3 border border-gray-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Tanggal Tanam
                  </span>
                  <p className="text-sm font-bold text-gray-800">
                    {formatDate(selectedLahan.tanggalTanam)}
                  </p>
                </div>
                <div className="p-3 border border-gray-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Jenis Pupuk
                  </span>
                  <p className="text-sm font-bold text-gray-800">
                    {selectedLahan.pupuk || "N/A"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FEFAE0]/30 border border-gray-200/80 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">
                  Estimasi Panen Berikutnya
                </span>
                <span className="font-extrabold text-[#606C38]">
                  {formatDate(selectedLahan.waktuPanenEstimate)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() =>
                selectedLahan && handleDeleteLahan(selectedLahan.id)
              }
              className="w-full sm:w-1/2 h-11 border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl shadow-none flex items-center justify-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Hapus Lahan
            </Button>

            <Button
              onClick={() =>
                selectedLahan && handleOpenEditDialog(selectedLahan)
              }
              className="w-full sm:w-1/2 h-11 bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold rounded-xl shadow-none flex items-center justify-center gap-1.5"
            >
              <Edit className="h-4 w-4" /> Edit Data Lahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- "EDIT LAHAN" DIALOG MODAL --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Edit Data Kebun Lahan
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Perbarui rincian data lahan terdaftar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditLahan} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">
                Nama Kebun / Blok
              </Label>
              <Input
                placeholder="Contoh: Kebun Blok C Selatan"
                value={namaLahan}
                onChange={(e) => setNamaLahan(e.target.value)}
                className="h-11 rounded-xl text-xs"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">
                  Luas (Meter persegi)
                </Label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={luasLahan}
                  onChange={(e) => setLuasLahan(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">
                  Jumlah Pohon
                </Label>
                <Input
                  type="number"
                  placeholder="300"
                  value={pohonLahan}
                  onChange={(e) => setPohonLahan(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">
                Lokasi Kebun
              </Label>
              <Input
                placeholder="Kecamatan / Desa"
                value={lokasiLahan}
                onChange={(e) => setLokasiLahan(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">
                Deskripsi (Opsional)
              </Label>
              <Input
                placeholder="misal: Lahan di dekat sungai"
                value={deskripsiLahan}
                onChange={(e) => setDeskripsiLahan(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">
                Tanggal Tanam (Opsional)
              </Label>
              <Input
                type="date"
                value={tanggalTanam}
                onChange={(e) => setTanggalTanam(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="w-full bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-11 rounded-xl shadow-none"
              >
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
