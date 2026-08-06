"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  User,
  Phone,
  LogOut,
  Save,
  Loader2,
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Flame,
  Award,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Pencil,
  X,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getAvatarInitials } from "@/lib/utils";
import { formatRupiah } from "@/utils/formatter";

export default function PetaniProfilPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    error?: boolean;
  } | null>(null);

  // ui popup dr bwh state buat edit profil
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // fetch data profil n dompet idr user
  const fetchProfilData = useCallback(async () => {
    try {
      const res = await fetch("/api/app/profil");
      if (res.ok) {
        const data = await res.json();
        console.log(data);

        setProfile(data);
        setName(data.name || "");
        setPhoneNumber(data.phoneNumber || "");
      }
    } catch (err) {
      console.error("Gagal load data profil:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfilData();
  }, [fetchProfilData]);

  // handle update nama n no hp via API
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // validasi no hp indo dlu hrus 08 depannya
    if (!/^08\d{8,11}$/.test(phoneNumber)) {
      setMessage({
        text: "Nomor HP harus diawali '08' dan berisi 10-13 digit angka.",
        error: true,
      });
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/app/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneNumber }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal update profil");
      }

      const updated = await res.json();
      setProfile((prev: any) => ({ ...prev, ...updated }));
      setMessage({ text: "Profil berhasil diperbarui!" });
      setTimeout(() => {
        setIsBottomSheetOpen(false);
        setMessage(null);
      }, 1000);
    } catch (err: any) {
      setMessage({
        text: err.message || "Gagal menyimpan perubahan.",
        error: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // bikin fungsi logout ngapus session nextauth
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FFFFFF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#606C38]" />
      </div>
    );
  }

  const displayName = profile?.name || session?.user?.name || "xxxxxx";
  const displayPhone = profile?.phoneNumber || "xxxxxx";
  const avatarInitials = getAvatarInitials(displayName);
  const idrBalance = profile?.wallet?.balance || 0;
  const ecoPointsBalance = profile?.ecoPoints || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF] pb-28">
      {/* HEADER: DARK FINTECH VIBE */}
      <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-none relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 relative z-10">
          <div
            onClick={() => setIsBottomSheetOpen(true)}
            className="flex flex-col sm:flex-row items-center gap-4 cursor-pointer group w-full sm:w-auto"
            title="Klik untuk Edit Profil"
          >
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-[#606C38] text-white flex items-center justify-center text-2xl font-extrabold border-4 border-slate-700/60 shadow-none shrink-0">
                {avatarInitials}
              </div>
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-[#DDA15E] text-slate-950 flex items-center justify-center border-2 border-slate-900">
                <Pencil className="h-3 w-3" />
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight group-hover:text-[#DDA15E] transition-colors">
                  {displayName}
                </h1>
                <Badge className="bg-[#606C38] text-white text-[10px] font-extrabold shadow-none border-0">
                  Level: Petani Hijau
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
                <Phone className="h-3.5 w-3.5 text-[#DDA15E]" /> {displayPhone}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {profile?.kopdes?.name || "Belum Terverifikasi"}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsBottomSheetOpen(true)}
            size="sm"
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl h-9 px-4 border border-slate-700 shadow-none flex items-center gap-1.5 shrink-0"
          >
            <Pencil className="h-3.5 w-3.5 text-[#DDA15E]" /> Edit Profil
          </Button>
        </div>
      </div>

      {/* DUAL WALLET UI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WALLET 1: IDR CASH WALLET */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#606C38]" /> SALDO TUNAI (IDR)
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {formatRupiah(idrBalance)}
            </h2>
            <p className="text-[11px] font-semibold text-gray-400">
              Hasil Penjualan Panen & Insentif Kemitraan
            </p>
          </div>

          {/* CTA Buttons IDR */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                alert("Fitur Tarik Tunai ke Bank / e-Wallet segera hadir.")
              }
              className="h-9 text-[11px] font-bold border-gray-200 hover:border-[#606C38] hover:text-[#606C38] rounded-xl shadow-none flex items-center justify-center gap-1"
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-[#606C38]" /> Tarik
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Riwayat Transaksi Keuangan Dompet IDR.")}
              className="h-9 text-[11px] font-bold border-gray-200 hover:border-[#606C38] hover:text-[#606C38] rounded-xl shadow-none flex items-center justify-center gap-1"
            >
              <History className="h-3.5 w-3.5 text-gray-500" /> Riwayat
            </Button>
          </div>
        </Card>

        {/* WALLET 2: GAMIFIED ECO-POINTS WALLET */}
        <Card className="bg-gradient-to-br from-[#FEFAE0] via-amber-50 to-[#FEFAE0] border border-amber-200 rounded-2xl shadow-none p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-[#BC6C25]" /> ECO-POINTS SAYA
              </span>
              <div className="flex items-center gap-1 bg-amber-200/60 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-amber-900">
                <Flame className="h-3 w-3 text-orange-600 fill-orange-500" />{" "}
                7-Day Streak
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {ecoPointsBalance.toLocaleString("id-ID")}
              </h2>
              <span className="text-sm font-bold text-[#BC6C25]">Pts</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-800">
              <Award className="h-3.5 w-3.5 text-[#BC6C25]" /> X Badges
              Keberlanjutan Terbuka
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900">
              Tukar dengan Voucher & Token Listrik
            </span>
            <Link href="/app/eco-points">
              <Button
                size="sm"
                className="h-9 text-xs font-bold bg-[#BC6C38] hover:bg-[#a55c1e] text-white rounded-xl shadow-none flex items-center gap-1"
              >
                Katalog Hadiah <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* SETTINGS MENU LIST */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-none overflow-hidden">
        <div className="divide-y divide-gray-100">
          <button
            onClick={() => setIsBottomSheetOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Ubah Data Diri
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  Edit Nama dan Nomor HP
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            onClick={() =>
              alert("Pusat Bantuan Coconeeds Customer Support 24/7.")
            }
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Bantuan & Customer Support
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  Panduan Aplikasi & Layanan Bantuan
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            onClick={() => alert("Pengaturan PIN Keamanan Transaksi.")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Keamanan & PIN Transaksi
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  Ubah 6-digit PIN Keamanan
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </Card>

      {/* PROMINENT RED LOGOUT BUTTON */}
      <Card className="bg-red-50/60 border border-red-100 rounded-2xl shadow-none">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-red-900">Keluar dari Akun</h3>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-11 rounded-xl shadow-none flex items-center justify-center gap-2 px-6 shrink-0"
          >
            <LogOut className="h-4 w-4" /> Keluar dari Akun
          </Button>
        </CardContent>
      </Card>

      {/* BOTTOM SHEET (DRAWER UX) EDIT PROFILE MODAL */}
      {isBottomSheetOpen && (
        <>
          {/* Overlay Backdrop */}
          <div
            onClick={() => setIsBottomSheetOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Bottom Sheet Container */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl p-6 shadow-2xl border-t border-gray-200 max-w-lg mx-auto font-['Quicksand',sans-serif]">
            {/* Drag Handle Top */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-[#606C38]" />
                <h3 className="text-lg font-bold text-gray-900">
                  Ubah Data Profil
                </h3>
              </div>
              <button
                onClick={() => setIsBottomSheetOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {message && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    message.error
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-[#606C38]/10 text-[#606C38] border border-[#606C38]/20"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">
                  Nama Lengkap
                </Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="h-11 rounded-xl border-gray-300 text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">
                  Nomor HP (Harus diawali 08, 10-13 digit)
                </Label>
                <Input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08123456789"
                  className="h-11 rounded-xl border-gray-300 text-xs font-bold"
                  required
                />
              </div>

              <div className="pt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBottomSheetOpen(false)}
                  className="w-1/2 h-11 text-xs font-bold rounded-xl border-gray-200"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 h-11 text-xs font-bold bg-[#606C38] hover:bg-[#283618] text-white rounded-xl shadow-none flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
