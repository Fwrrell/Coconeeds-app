"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  QrCode,
  Search,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PerusahaanTraceabilityPage() {
  const router = useRouter();
  const [manualBatchId, setManualBatchId] = useState("");

  // ekstrak id batch dari url qr code & navigasi ke halaman sertifikat esg
  const handleScanSuccess = (decodedText: string) => {
    const match = decodedText.match(/\/certificate\/([^/?#]+)/);
    const batchId = match ? match[1] : decodedText.trim();
    if (batchId) {
      router.push(`/certificate/${batchId}`);
    }
  };

  useEffect(() => {
    // inisialisasi scanner camera html5-qrcode
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      /* verbose= */ false,
    );

    scanner.render(handleScanSuccess, (error) => {
      // silent per-frame scan error
    });

    // bersihin instance kamera biar ga nyala terus saat unmount / pindah halaman
    return () => {
      scanner
        .clear()
        .catch((err) => console.error("Gagal bersihin instance camera:", err));
    };
  }, []);

  // navigasi manual ke halaman sertifikat esg
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBatchId.trim()) return;
    router.push(`/certificate/${manualBatchId.trim()}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]">
      {/* Top Header & Back Link */}
      <div className="flex flex-col space-y-3 border-b border-gray-100 pb-5">
        {/* <Link
          href="/perusahaan"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#606C38] hover:underline w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Portal Perusahaan
        </Link> */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#606C38] text-white flex items-center justify-center">
                <QrCode className="h-4 w-4" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                ESG Traceability & QR Scanner
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
              Scan QR Code kargo atau masukkan ID Batch untuk memverifikasi
              sertifikat keberlanjutan ESG & jejak digital ledger.
            </p>
          </div>
        </div>
      </div>

      {/* Main Scanner Container */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-none p-5 sm:p-6 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-[#606C38]" /> Pindai QR Code Kargo
            Kelapa
          </h2>
          <p className="text-xs font-medium text-gray-500 max-w-md mx-auto">
            Arahkan kamera perangkat Anda ke QR Code yang tertera pada dokumen
            pengiriman atau kemasan kargo.
          </p>
        </div>

        {/* Container QR Camera Reader */}
        <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-2">
          <div id="reader" className="w-full rounded-xl overflow-hidden" />
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Atau Pencarian Manual
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Manual Fallback Input */}
        <form
          onSubmit={handleManualSearch}
          className="space-y-4 max-w-md mx-auto"
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">
              Masukkan ID Batch / UUID Kargo
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Contoh: BATCH-89102-XAB / UUID..."
                value={manualBatchId}
                onChange={(e) => setManualBatchId(e.target.value)}
                className="h-11 rounded-xl text-xs flex-1"
                required
              />
              <Button
                type="submit"
                className="bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-11 px-5 rounded-xl shadow-none flex items-center gap-1.5 shrink-0"
              >
                <Search className="h-4 w-4" /> Cari Sertifikat
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* ESG Traceability Info Banner */}
      <div className="p-4 rounded-2xl bg-[#FEFAE0]/40 border border-gray-200/80 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#606C38] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-gray-900">
            Jaminan Transparansi Rantai Pasok ESG
          </h4>
          <p className="text-gray-600 font-medium leading-relaxed">
            Sertifikat ESG Coconeeds memuat data asal-usul kebun petani,
            peringkat QC komoditas, serta bukti hash SHA-256 ledger immutability
            yang tidak dapat dimanipulasi.
          </p>
        </div>
      </div>
    </div>
  );
}
