"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  Package,
  Users,
  Warehouse,
  Ship,
  Fingerprint,
  FileText,
  Hash,
  ArrowRight,
  MapPin,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

interface TimelineEvent {
  step: string;
  location: string;
  date: string;
  status: string;
}

interface CertificateData {
  batchId: string;
  commodity: string;
  totalWeight: number;
  grade: string;
  status: string;
  origin: string;
  farmerCount: number;
  timeline: TimelineEvent[];
  ledger: {
    prevHash: string;
    currentHash: string;
    verifiedAt: string;
  } | null;
}

export default function CertificatePage() {
  const params = useParams<{ id: string }>();
  const batchId = params?.id;

  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!batchId) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/ledger/${batchId}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Gagal memuat sertifikat");
        }

        setData(json.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [batchId]);

  const getTimelineIcon = (index: number, stepName: string) => {
    if (
      stepName.toLowerCase().includes("laut") ||
      stepName.toLowerCase().includes("kapal")
    )
      return Ship;
    if (
      stepName.toLowerCase().includes("pembeli") ||
      stepName.toLowerCase().includes("perusahaan")
    )
      return Building;
    return Warehouse;
  };

  if (loading) {
    return <CertificateLoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-4">
        <FileText className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">
          Sertifikat Tidak Ditemukan
        </h1>
        <p className="text-slate-600 mt-2 max-w-md">
          {error ||
            "ID Batch yang Anda cari tidak valid atau tidak ada dalam sistem ledger kami."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <main className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12">
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 border-4 border-white shadow-sm">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
            Sertifikat Traceability C-Trace
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-3xl mx-auto">
            Verifikasi Orisinalitas & Rantai Pasok Berkelanjutan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* KOLOM KIRI (SUMMARY & BLOCKCHAIN) */}
          <div className="lg:col-span-1 space-y-8">
            {/* CARD INFO KARGO */}
            <Card className="shadow-lg border-green-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                  <Package className="w-7 h-7 text-green-600" />
                  Ringkasan Kargo
                </CardTitle>
                <CardDescription className="font-mono text-xs break-all">
                  ID: {data.batchId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Komoditas</span>
                  <Badge variant="secondary" className="text-base uppercase">
                    {data.commodity}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">
                    Total Berat
                  </span>
                  <span className="font-semibold text-slate-700">
                    {data.totalWeight.toLocaleString("id-ID")} kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">
                    Grade Kualitas
                  </span>
                  <span className="font-semibold text-slate-700">
                    Grade {data.grade}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Status</span>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    {data.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* CARD LEDGER BLOCKCHAIN */}
            {data.ledger && (
              <Card className="shadow-lg bg-slate-800 text-white border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl text-white">
                    <Fingerprint className="w-7 h-7 text-green-400" />
                    Verifikasi Ledger
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Integritas data dijamin melalui hash kriptografi.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 font-mono text-xs">
                  <div>
                    <Label className="text-slate-400 text-sm">
                      Previous Hash
                    </Label>
                    <p className="break-all text-slate-300 leading-relaxed bg-slate-900 p-2 rounded mt-1">
                      {data.ledger.prevHash ||
                        "0x00000000000000000000000000000000"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">
                      Current Hash
                    </Label>
                    <p className="break-all text-green-400 font-bold leading-relaxed bg-slate-900 p-2 rounded mt-1">
                      {data.ledger.currentHash}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Badge
                      variant="outline"
                      className="border-green-400 text-green-300"
                    >
                      <Hash className="w-3 h-3 mr-1.5" /> Immutable Record
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* KOLOM KANAN (ESG & TIMELINE) */}
          <div className="lg:col-span-2 space-y-8">
            {/* CARD ESG */}
            <Card className="shadow-lg border-green-200/50 overflow-hidden">
              <div className="bg-green-50/50 p-6 border-b border-green-100">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800 mb-2">
                  <Users className="w-7 h-7 text-green-600" />
                  Asal Usul & Dampak Sosial
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Kargo ini mematuhi standar perdagangan adil (Fair Trade) dan
                  dilacak langsung hingga ke tingkat komunitas desa.
                </CardDescription>
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" /> Sumber
                      Utama: {data.origin}
                    </span>
                    <span className="text-sm font-bold text-green-700">
                      100%
                    </span>
                  </div>
                  <Progress value={100} className="h-3 bg-green-100" />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <div className="text-center sm:text-left mb-2 sm:mb-0">
                    <p className="text-sm font-medium text-slate-600">
                      Pemberdayaan Lokal
                    </p>
                    <h4 className="font-bold text-green-800 text-xl">
                      Total Petani Terlibat
                    </h4>
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm border-2 border-green-200 text-2xl font-black text-green-600">
                    {data.farmerCount}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD TIMELINE LOGISTIK */}
            <Card className="shadow-lg border-green-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                  <ArrowRight className="w-7 h-7 text-green-600" />
                  Jejak Rantai Pasok
                </CardTitle>
                <CardDescription>
                  Perjalanan kargo fisik dari fasilitas pengolahan ke tempat
                  tujuan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-200">
                  {data.timeline.map((item, index) => {
                    const Icon = getTimelineIcon(index, item.step);
                    return (
                      <div
                        key={index}
                        className="relative flex items-start gap-5"
                      >
                        <div
                          className={`z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-md text-white ${item.status === "COMPLETED" ? "bg-green-600" : "bg-slate-300"}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p
                            className={`font-semibold ${item.status === "COMPLETED" ? "text-slate-800" : "text-slate-500"}`}
                          >
                            {item.step}
                          </p>
                          <p className="text-sm text-slate-500 mb-1">
                            {new Date(item.date).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm font-medium text-slate-600 bg-slate-100 inline-block px-2 py-1 rounded">
                            {item.location}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Komponen Loading
function CertificateLoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 animate-pulse">
      <div className="text-center mb-12">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-12 w-3/4 mx-auto mb-3" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full mt-4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
