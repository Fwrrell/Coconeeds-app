"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Sprout,
  Warehouse,
  Truck,
  Recycle,
  PlusCircle,
  Send,
  CheckCircle2,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { getAvatarInitials } from "@/lib/utils";
import { registerDialog } from "@/lib/tourGuide/tourController";
import { getDefaultSatuan } from "@/lib/satuan";

// nav item list buat petani kebun
const FARMER_NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/app",
    icon: LayoutDashboard,
    tour: "menu-dashboard",
  },
  { name: "Lahan Kebun", href: "/app/lahan", icon: Sprout, tour: "menu-lahan" },
  {
    name: "Produksi & Stok",
    href: "/app/produksi",
    icon: Warehouse,
    tour: "menu-produksi",
  },
  {
    name: "Pengiriman",
    href: "/app/pengiriman",
    icon: Truck,
    tour: "menu-pengiriman",
  },
  {
    name: "Eco-Points",
    href: "/app/eco-points",
    icon: Recycle,
    tour: "menu-Ecopoint",
  },
];

export function FarmerSidebar({
  isHarvestModalOpen: externalOpen,
  setIsHarvestModalOpen: setExternalOpen,
}: {
  isHarvestModalOpen?: boolean;
  setIsHarvestModalOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const isModalOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setModalOpen = setExternalOpen || setInternalOpen;

  const [modalSuccess, setModalSuccess] = useState(false);

  // Helper fungsi untuk membuka dan menutup dialog dari App Tour & Handler
  const openHarvestDialog = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const closeHarvestDialog = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  useEffect(() => {
    registerDialog("open-harvest-dialog", openHarvestDialog);
    registerDialog("close-harvest-dialog", closeHarvestDialog);
  }, [openHarvestDialog, closeHarvestDialog]);

  const handleOpenHarvestModal = () => {
    openHarvestDialog();
  };

  // dynamic user data n avatar initials logic
  const userName = session?.user?.name || "Pak Agus";
  const avatarInitials = getAvatarInitials(userName);
  const [userProfile, setUserProfile] = useState<any>(null);

  // form state panen komoditas
  const [kategori, setKategori] = useState("Produk Primer");
  const [jenisProduk, setJenisProduk] = useState("Kelapa Utuh");
  const [jumlah, setJumlah] = useState(500);
  const [lahanSelected, setLahanSelected] = useState<string>("");

  // inventory stock state
  const [stocks, setStocks] = useState<any[]>([]);

  // real lahan data state
  const [lahanList, setLahanList] = useState<any[]>([]);
  const [isLoadingLahan, setIsLoadingLahan] = useState(false);

  // fetch data lahan user & inventory stocks sblm render modal
  const fetchModalData = useCallback(async () => {
    setIsLoadingLahan(true);
    try {
      const [lahanRes, inventoryRes] = await Promise.all([
        fetch("/api/app/lahan"),
        fetch("/api/app/inventori"),
      ]);

      if (lahanRes.ok) {
        const data = await lahanRes.json();
        setLahanList(data);
        if (data && data.length > 0) {
          setLahanSelected(data[0].id);
        }
      }
      if (inventoryRes.ok) {
        const { stocks } = await inventoryRes.json();
        setStocks(stocks);
      }
    } catch (err) {
      console.error("Gagal load data modal:", err);
    } finally {
      setIsLoadingLahan(false);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        fetchModalData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, fetchModalData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/app/profil");
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // filter options produk berdasarkan kategori komoditas
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

  const handleHarvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedLahanObj = lahanList.find((l) => l.id === lahanSelected);
      const keteranganText = selectedLahanObj
        ? `Panen dari ${selectedLahanObj.namaLahan}`
        : "Penambahan stok panen";

      const mappedKategori =
        kategori === "Produk Primer" || kategori === "PRODUK_PRIMER"
          ? "PRODUK_PRIMER"
          : kategori === "Produk Olahan" || kategori === "PRODUK_OLAHAN"
            ? "PRODUK_OLAHAN"
            : "PRODUK_SAMPINGAN";

      // auto-derive unit from existing stock, or default to 'Kg'
      const derivedSatuan =
        stocks.find((s) => s.jenisProduk === jenisProduk)?.satuan ||
        getDefaultSatuan(jenisProduk);

      const res = await fetch("/api/app/inventori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kategori: mappedKategori,
          jenisProduk,
          jumlah: Number(jumlah),
          satuan: derivedSatuan,
          keterangan: keteranganText,
        }),
      });

      if (res.ok) {
        setModalSuccess(true);
        // refresh data background biar UI langsung update
        router.refresh();

        setTimeout(() => {
          setModalSuccess(false);
          setModalOpen(false);
        }, 1200);
      } else {
        const errorData = await res.json();
        console.error("Gagal nyimpen data ke server. Detail:", errorData);
      }
    } catch (err) {
      console.error("Error submitting panen:", err);
    }
  };

  const kopdesLabel =
    userProfile?.isVerified && userProfile?.kopdes?.name
      ? `${userProfile.kopdes.name}`
      : "Akun belum terverifikasi";

  return (
    <>
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white h-screen sticky top-0 font-['Quicksand',sans-serif] z-30 shrink-0">
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              width={40}
              height={40}
              alt="Logo Coconeeds"
            />
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 leading-tight">
                Coconeeds
              </h2>
              <p className="text-xs font-bold text-[#606C38]">Farmer Portal</p>
            </div>
          </div>
        </div>

        {/* Global CTA Button: + Catat Hasil Panen */}
        <div className="p-4 border-b border-gray-100">
          <Button
            data-tour="hasil-panen"
            onClick={handleOpenHarvestModal}
            className="w-full bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs h-11 rounded-xl shadow-none flex items-center justify-center gap-2 transition-colors"
          >
            <PlusCircle className="h-4 w-4" /> Catat Hasil Panen
          </Button>
        </div>

        {/* Navigation Menu Links */}
        <nav
          data-tour="navbar"
          className="flex-1 p-3 space-y-1 overflow-y-auto"
        >
          {FARMER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tour}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#606C38]/10 text-[#606C38] border border-[#606C38]/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-[#606C38]" : "text-gray-400"}`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile Connected to Auth Session */}
        <Link
          href="/app/profil"
          className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between hover:bg-gray-100/60 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-[#606C38] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
              {avatarInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 leading-tight truncate">
                {userName}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold truncate">
                {kopdesLabel}
              </p>
            </div>
          </div>
        </Link>
      </aside>

      {/* GLOBAL MODAL: CATAT HASIL & PENAMBAHAN INVENTORI */}
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-[#606C38]" />
              Catat Hasil & Penambahan Inventori
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Input hasil panen kebun atau penambahan stok fisik ke gudang
              inventori.
            </DialogDescription>
          </DialogHeader>

          {modalSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-[#606C38]/10 text-[#606C38] flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Stok Panen Berhasil Disimpan!
              </h3>
              <p className="text-xs font-medium text-gray-500">
                Data {jenisProduk} sebanyak {jumlah}{" "}
                {stocks.find((s) => s.jenisProduk === jenisProduk)?.satuan ||
                  getDefaultSatuan(jenisProduk)}{" "}
                telah ditambahkan ke Gudang.
              </p>
            </div>
          ) : (
            <form onSubmit={handleHarvestSubmit} className="space-y-4 py-2">
              {/* Field 1: Pilih Lahan (Wired to Real API Data) */}
              <div className="space-y-1.5" data-tour="form-kebun-asal">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-700">
                    Pilih Lahan Kebun
                  </Label>
                  {isLoadingLahan && (
                    <Loader2 className="h-3 w-3 animate-spin text-[#606C38]" />
                  )}
                </div>
                <Select
                  value={lahanSelected}
                  onValueChange={(val) => val && setLahanSelected(val)}
                  disabled={isLoadingLahan || lahanList.length === 0}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl border-gray-300 text-xs">
                    <SelectValue placeholder="Pilih Lahan">
                      {lahanSelected && lahanList.length > 0
                        ? (() => {
                            const selected = lahanList.find(
                              (lh: any) => lh.id === lahanSelected,
                            );
                            return selected
                              ? `${selected.namaLahan} (${selected.luasM2} m²)`
                              : "Pilih Lahan";
                          })()
                        : "Pilih Lahan"}
                    </SelectValue>
                  </SelectTrigger>{" "}
                  <SelectContent className="font-['Quicksand',sans-serif]">
                    {/* klo blm ada lahan kasi tau user */}
                    {lahanList.length > 0 ? (
                      lahanList.map((lh: any) => (
                        <SelectItem key={lh.id} value={lh.id}>
                          {lh.namaLahan} ({lh.luasM2} m²)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Belum ada lahan, tambah dulu di menu Lahan
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Field 2: Kategori Komoditas */}
              <div className="space-y-1.5" data-tour="form-kategori-produk">
                <Label className="text-xs font-bold text-gray-700">
                  Kategori Komoditas
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
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent className="font-['Quicksand',sans-serif]">
                    <SelectItem value="Produk Primer">Produk Primer</SelectItem>
                    <SelectItem value="Produk Olahan">Produk Olahan</SelectItem>
                    <SelectItem value="Produk Sampingan">
                      Produk Sampingan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Field 3: Jenis Produk */}
              <div className="space-y-1.5" data-tour="form-jenis-produk">
                <Label className="text-xs font-bold text-gray-700">
                  Jenis Produk
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

              {/* Field 4: Jumlah */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">
                  Jumlah Panen (
                  {stocks.find((s) => s.jenisProduk === jenisProduk)?.satuan ||
                    getDefaultSatuan(jenisProduk)}
                  )
                </Label>
                <Input
                  type="number"
                  placeholder="500"
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  className="h-11 rounded-xl border-gray-300 text-xs font-bold"
                  required
                />
              </div>

              {/* Submit CTA */}
              <DialogFooter className="pt-2">
                <Button
                  data-tour="form-simpan-panen"
                  type="submit"
                  disabled={lahanList.length === 0}
                  className="w-full bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-11 rounded-xl shadow-none flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> Simpan ke Gudang
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
