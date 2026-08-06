"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  CheckCircle2,
  Building,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// --- STATIC MOCK DATA (Profil Perusahaan) ---
const MOCK_COMPANY_PROFILE = {
  namaPerusahaan: "PT Industri Kelapa Nusantara",
  nib: "1289000192039",
  email: "procurement@kelapanusantara.co.id",
  telepon: "+62 811-987-6543",
  penanggungJawab: "Hendra Wijaya (Head of Procurement)",
  alamat: "Kawasan Industri Bitung No. 48, Kota Bitung, Sulawesi Utara",
  deskripsi: "Perusahaan pengolah turunan kelapa terpadu spesialisasi ekspor Kopra Putih High Grade, Minyak Kelapa Kasar (CNO), dan Briket Arang Batok.",
  kapasitasBulanKg: 50000,
  statusVerified: true,
};

export default function PerusahaanProfilPage() {
  const [profile, setProfile] = useState(MOCK_COMPANY_PROFILE);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#606C38] text-white flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Profil Perusahaan Off-taker
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            Mengelola identitas perusahaan, legalitas NIB, dan kuota pemesanan B2B.
          </p>
        </div>

        <Badge className="bg-[#606C38] text-white font-bold text-xs px-3 py-1.5 shadow-none w-fit flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" /> Terverifikasi B2B
        </Badge>
      </div>

      {/* Profile Form Card */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-900">
            Detail Informasi Badan Usaha
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isSaved && (
            <div className="mb-4 p-3.5 bg-[#606C38]/10 text-[#606C38] rounded-xl border border-[#606C38]/20 flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4" /> Perubahan profil perusahaan berhasil disimpan!
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Nama Perusahaan / PT</Label>
                <Input
                  value={profile.namaPerusahaan}
                  onChange={(e) => setProfile({ ...profile, namaPerusahaan: e.target.value })}
                  className="h-11 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Nomor Induk Berusaha (NIB)</Label>
                <Input
                  value={profile.nib}
                  onChange={(e) => setProfile({ ...profile, nib: e.target.value })}
                  className="h-11 rounded-xl text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Email Resmi Procurement</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="h-11 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Nomor Telepon Hotline</Label>
                <Input
                  value={profile.telepon}
                  onChange={(e) => setProfile({ ...profile, telepon: e.target.value })}
                  className="h-11 rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Penanggung Jawab Kemitraan</Label>
              <Input
                value={profile.penanggungJawab}
                onChange={(e) => setProfile({ ...profile, penanggungJawab: e.target.value })}
                className="h-11 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Alamat Pabrik / Gudang Utama</Label>
              <Textarea
                value={profile.alamat}
                onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                className="rounded-xl text-xs min-h-[70px]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Deskripsi Agroindustri & Spesifikasi Pembelian</Label>
              <Textarea
                value={profile.deskripsi}
                onChange={(e) => setProfile({ ...profile, deskripsi: e.target.value })}
                className="rounded-xl text-xs min-h-[90px]"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button type="submit" className="bg-[#606C38] hover:bg-[#283618] text-white font-bold text-xs h-11 px-6 rounded-xl shadow-none flex items-center gap-2">
                <Save className="h-4 w-4" /> Simpan Profil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
