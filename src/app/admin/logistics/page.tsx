"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Bot, Boxes, CheckCircle, Rocket, Ship, Truck, Layers, Sparkles, Anchor, History } from "lucide-react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { KopdesSelector } from "@/components/kopdes-selector";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

// --- Type Definitions ---
type Batch = {
  id: string;
  type: string;
  weight: number;
  grade: string;
  dateProcessed: string;
  originKopdes: string;
};

type Shipment = {
  id: string;
  namaKapal: string;
  rute: string;
  totalBiaya: number;
  totalWeight: number;
  status: string;
  createdAt: string;
};

// --- Main Component ---
export default function LogisticsManagementPage() {
  const { activeKopdesId } = useAdminStore();
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [historyShipments, setHistoryShipments] = useState<Shipment[]>([]);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [showAiResult, setShowAiResult] = useState(false);

  // --- Data Fetching & Business Logic ---
  const fetchLogistics = async () => {
    const currentKopdes = activeKopdesId || "ALL";
    try {
      const res = await fetch(`/api/pengiriman?kopdesId=${currentKopdes}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat data logistik");
      setAvailableBatches(data.availableBatches || []);
      setHistoryShipments(data.shipments || []);
    } catch (error: any) {
      console.error("Logistics Fetch Error:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchLogistics();
  }, [activeKopdesId]);

  const runAiPooling = () => {
    setIsAiRunning(true);
    setShowAiResult(false);
    setAiProgress(0);
    const interval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAiRunning(false);
          setShowAiResult(true);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  // execute pengiriman kapal real ke api db
  const handleConfirmShipment = async () => {
    if (availableBatches.length === 0) {
      toast.error("Tidak ada batch kargo yang tersedia untuk dikirim.");
      return;
    }

    try {
      const payload = {
        namaKapal: "KM Logistik Nusantara 4",
        rute: "Minahasa -> Pelabuhan Tanjung Perak Surabaya",
        totalBiaya: 15000000,
        batchIds: availableBatches.map((b) => b.id),
      };

      const res = await fetch("/api/pengiriman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pengiriman kapal.");

      toast.success("Pengiriman Kapal & Split Bill berhasil dibuat!");
      setShowAiResult(false);
      await fetchLogistics();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const totalWeight = availableBatches.reduce((acc, curr) => acc + (curr.weight || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 bg-[#FFFFFF] min-h-screen font-['Quicksand',sans-serif]"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#606C38]/10 text-[#606C38]">
              <Truck className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Logistics & Cargo Pooling
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Gunakan AI untuk efisiensi rute & optimasi biaya pengiriman komoditas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <KopdesSelector />
          <Badge variant="outline" className="border-gray-300 text-gray-700 bg-gray-50/50 py-1.5 px-3 font-semibold text-xs">
            <Layers className="mr-1.5 h-3.5 w-3.5 text-[#606C38]" />
            {availableBatches.length} Batch Ready
          </Badge>
        </div>
      </div>

      {/* Available Stock Table Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-[#606C38]" />
            Stok Tersedia untuk Pooling
          </h2>
          <span className="text-xs font-semibold text-gray-500">
            Total Berat: {totalWeight.toFixed(1)} kg
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Batch ID</TableHead>
                  <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Asal Kopdes</TableHead>
                  <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Komoditas</TableHead>
                  <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Berat</TableHead>
                  <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableBatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-gray-400 font-medium">
                      Tidak ada batch stok yang tersedia untuk pooling.
                    </TableCell>
                  </TableRow>
                ) : (
                  availableBatches.map((batch) => (
                    <TableRow
                      key={batch.id}
                      className="border-b border-gray-100 odd:bg-white even:bg-[#FEFAE0]/10 hover:bg-gray-50/80 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-semibold text-gray-700">{batch.id}</TableCell>
                      <TableCell className="text-sm font-medium text-gray-800">{batch.originKopdes}</TableCell>
                      <TableCell className="text-sm font-medium text-gray-700">{batch.type}</TableCell>
                      <TableCell className="text-sm font-semibold text-gray-900">{batch.weight.toFixed(1)} kg</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-[#606C38]/30 bg-[#606C38]/5 text-[#606C38] font-bold text-xs"
                        >
                          {batch.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* AI Cargo Pooling Action & Recommendation */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50/60 rounded-md border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-[#606C38] text-white mt-0.5">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                AI Cargo Pooling Engine
                <Sparkles className="h-4 w-4 text-[#DDA15E]" />
              </h2>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                Algoritma kecerdasan buatan akan mengonsolidasikan batch kargo untuk mengoptimalkan biaya rute laut & darat.
              </p>
            </div>
          </div>
          <Button
            onClick={runAiPooling}
            disabled={isAiRunning || availableBatches.length === 0}
            className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold shadow-none rounded-md px-4 py-2 text-sm shrink-0"
          >
            <Rocket className="mr-2 h-4 w-4" />
            {isAiRunning ? "Menganalisa..." : "Jalankan AI Cargo Pooling"}
          </Button>
        </div>

        {isAiRunning && (
          <div className="p-4 border border-gray-200 rounded-md space-y-2 bg-white">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Memproses Logika Consolidation & Split Bill...</span>
              <span>{aiProgress}%</span>
            </div>
            <Progress value={aiProgress} className="h-2 bg-gray-100" />
          </div>
        )}

        {showAiResult && (
          <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-[#FEFAE0]/30 py-3.5 px-5">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-[#606C38]" />
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">
                    Rekomendasi AI Ditemukan!
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-gray-600">
                    AI merekomendasikan penggabungan batch kargo untuk efisiensi pengiriman masal.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 p-5">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Detail Logistik
                </h4>
                <div className="space-y-2 border border-gray-100 rounded-md p-3.5 bg-gray-50/40">
                  <InfoItem label="Saran Kapal" value="KM Logistik Nusantara 4" icon={Ship} />
                  <Separator className="bg-gray-200/60" />
                  <InfoItem label="Total Kargo" value={`${(totalWeight / 1000).toFixed(1)} Ton`} />
                  <Separator className="bg-gray-200/60" />
                  <InfoItem label="Estimasi Biaya" value="Rp 15.000.000" />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Kalkulasi Split Bill (Proporsional)
                </h4>
                <div className="p-3.5 rounded-md bg-gray-50/40 border border-gray-100 space-y-2.5">
                  <SplitBillItem kopdes="Kopdes Terhubung" weight={totalWeight} percentage={100} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 bg-gray-50/30 p-4 flex justify-end">
              <Button
                onClick={handleConfirmShipment}
                className="w-full sm:w-auto bg-[#606C38] hover:bg-[#283618] text-white font-semibold shadow-none rounded-md px-5"
              >
                Konfirmasi & Buat Pengiriman Real
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <Separator className="bg-gray-200" />

      {/* tampilin riwayat pengiriman kapal real */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Anchor className="h-4 w-4 text-[#606C38]" />
          Riwayat Dispatch Pengiriman Kapal Real ({historyShipments.length})
        </h2>

        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Nama Kapal</TableHead>
                  <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Rute Laut</TableHead>
                  <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Total Berat</TableHead>
                  <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Total Biaya</TableHead>
                  <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Status Dispatch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-gray-400 font-medium">
                      Belum ada dispatch pengiriman kapal yang dilakukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  historyShipments.map((s) => (
                    <TableRow
                      key={s.id}
                      className="border-b border-gray-100 odd:bg-white even:bg-[#FEFAE0]/10 hover:bg-gray-50/80 transition-colors"
                    >
                      <TableCell className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Ship className="h-4 w-4 text-[#606C38]" /> {s.namaKapal}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-gray-700">{s.rute}</TableCell>
                      <TableCell className="text-sm font-semibold text-gray-900">{s.totalWeight?.toFixed(1) || 0} kg</TableCell>
                      <TableCell className="text-sm font-bold text-[#606C38]">Rp {s.totalBiaya?.toLocaleString("id-ID") || 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-800 font-bold text-xs">
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Helper Components ---
const InfoItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="font-bold text-gray-800 flex items-center gap-1.5">
      {Icon && <Icon className="h-4 w-4 text-[#606C38]" />}
      {value}
    </span>
  </div>
);

const SplitBillItem = ({
  kopdes,
  weight,
  percentage,
}: {
  kopdes: string;
  weight: number;
  percentage: number;
}) => (
  <div className="flex justify-between items-center text-sm">
    <span className="font-semibold text-gray-800">{kopdes}</span>
    <span className="text-gray-500 font-mono text-xs">{weight.toLocaleString()} kg</span>
    <Badge
      variant="outline"
      className="bg-[#DDA15E]/15 border-[#BC6C25]/30 text-[#BC6C25] font-bold text-xs"
    >
      {percentage.toFixed(1)}%
    </Badge>
  </div>
);
