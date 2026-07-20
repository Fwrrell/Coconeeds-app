"use client";

import Image from "next/image";
import { Users, ShoppingCart, Truck, BarChart3 } from "lucide-react";
import { AdminLoginCard } from "@/components/admin-login-card";

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2 bg-[#FEFAE0]">
      {/* Left Side */}
      <div className="relative hidden lg:flex flex-col justify-center bg-[#283618] p-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] h-[70%] w-[70%] rounded-full border border-white/20" />
          <div className="absolute top-[10%] -left-[20%] h-[80%] w-[80%] rounded-full border border-white/20" />
          <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-[#606C38] blur-3xl mix-blend-screen" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-lg space-y-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Coconeeds"
              width={40}
              height={40}
              className="brightness-0 invert"
            />
            <span className="text-xl font-bold tracking-wide">coconeeds</span>
          </div>

          {/* Header Title */}
          <div className="space-y-4">
            <h1 className="font-serif text-5xl font-bold leading-tight">
              Admin Dashboard
            </h1>
            <div className="h-1 w-16 rounded-full bg-[#DDA15E]" />
          </div>

          {/* Fitur List */}
          <div className="space-y-8">
            {/* Item 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-[#606C38]/40 p-3 text-[#FEFAE0]">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Manajemen Pengguna</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Pantau dan verifikasi data petani serta mitra perusahaan
                  secara efisien.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-[#606C38]/40 p-3 text-[#FEFAE0]">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Marketplace & Transaksi
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  Kelola dan validasi alur jual beli komoditas kelapa antar
                  pengguna.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-[#606C38]/40 p-3 text-[#FEFAE0]">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Logistik & Kargo</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Sistem pooling kargo terpusat untuk efisiensi distribusi dan
                  pengiriman.
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-[#606C38]/40 p-3 text-[#FEFAE0]">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Laporan & Analitik</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Data statistik komprehensif untuk pengambilan keputusan
                  strategis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          PANEL KANAN: Beige (Form / Card Login Area)
      ================================================== */}
      <div className="relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
        {/* Efek Blur Cahaya Estetik */}
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#DDA15E]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#606C38]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Komponen Card akan dipasang di sini pada Tahap 2 */}
          <AdminLoginCard />
        </div>
      </div>
    </div>
  );
}
