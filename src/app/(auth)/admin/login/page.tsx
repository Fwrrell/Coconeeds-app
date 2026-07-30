"use client";

import { Users, ShoppingCart, Truck, BarChart3, Sprout } from "lucide-react";
import { AdminLoginCard } from "@/components/admin-login-card";
import { motion } from "framer-motion";

export function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#FFFFFF] font-['Quicksand',sans-serif]">
      {/* Left Side: Brand Overview with Artistic Background */}
      <div className="relative hidden lg:flex flex-col justify-between bg-[#283618] p-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] h-[70%] w-[70%] rounded-full border border-white/20" />
          <div className="absolute top-[10%] -left-[20%] h-[80%] w-[80%] rounded-full border border-white/20" />
          <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-[#606C38] blur-3xl mix-blend-screen" />
        </div>

        {/* Wrapper */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full max-w-lg mx-auto">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#606C38] text-white">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Coconeeds
              </span>
            </div>

            {/* Header Title */}
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Administrator Platform
              </h1>
              <p className="text-sm font-medium text-slate-300 max-w-md">
                Pusat kendali terpadu untuk pengawasan logistik, verifikasi unit
                Kopdes, analitik komoditas, dan marketplace B2B.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-6">
              <div className="flex items-start gap-3.5 p-3 rounded-md border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex-shrink-0 rounded-md bg-[#606C38]/60 p-2.5 text-[#FEFAE0]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Manajemen Pengguna & Farmer
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-300">
                    Verifikasi identitas petani, admin Kopdes, dan mitra
                    perusahaan off-taker.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-md border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex-shrink-0 rounded-md bg-[#606C38]/60 p-2.5 text-[#FEFAE0]">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Marketplace & Kontrak B2B
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-300">
                    Kelola listing Want to Buy (WTB) dan alur negosiasi
                    kesepakatan komoditas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-md border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex-shrink-0 rounded-md bg-[#606C38]/60 p-2.5 text-[#FEFAE0]">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Logistik & Kargo Pooling
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-300">
                    Algoritma konsolidasi muatan untuk efisiensi pengiriman
                    antar pulau.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-md border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex-shrink-0 rounded-md bg-[#606C38]/60 p-2.5 text-[#FEFAE0]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Laporan & ESG Traceability
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-300">
                    Transparansi rantai pasok dan pelacakan QR batch sertifikasi
                    mutu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="text-xs font-semibold text-white/40 mt-8">
            Coconeeds Enterprise Security Standard v2.4
          </div>
        </div>
      </div>

      {/* Right Side: Form / Card Area */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-[#FFFFFF]">
        <div className="w-full max-w-md">
          <AdminLoginCard />
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
