"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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
  Warehouse,
  Weight,
  QrCode,
  ClipboardCheck,
  Boxes,
  HardDrive,
  Calendar,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { toast } from "sonner";
import { motion } from "framer-motion";

// --- Type Definitions ---
type Harvest = {
  id: string;
  date: string;
  farmerName: string;
  farmerPhone?: string;
  type: string;
  declaredWeight: number;
  status: string;
  handoverPin?: string;
  handoverValidatedAt?: string;
  pickupScheduledAt?: string;
  pengirimanMethod?: string;
};

type Batch = {
  id: string;
  type: string;
  totalWeight: number;
  grade: string;
  dateProcessed: string;
  status: string;
};

// --- Main Component ---
export default function AdminInventoryPage() {
  const { activeKopdesId } = useAdminStore();

  const [pendingHarvests, setPendingHarvests] = useState<Harvest[]>([]);
  const [warehouseBatches, setWarehouseBatches] = useState<Batch[]>([]);
  const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);
  const [isQcDialogOpen, setIsQcDialogOpen] = useState(false);
  const [selectedBatchForQR, setSelectedBatchForQR] = useState<Batch | null>(
    null,
  );
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

  // modal jadwalkan penjemputan & validasi pin
  const [scheduleHarvest, setScheduleHarvest] = useState<Harvest | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  const [pinHarvest, setPinHarvest] = useState<Harvest | null>(null);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");

  // --- Stats Calculation ---
  const totalPendingQc = pendingHarvests.reduce(
    (acc, h) => acc + h.declaredWeight,
    0,
  );
  const totalInWarehouse = warehouseBatches.reduce(
    (acc, b) => acc + b.totalWeight,
    0,
  );
  const warehouseCapacity = 10000;
  const capacityPercentage = Math.min((totalInWarehouse / warehouseCapacity) * 100, 100);

  // --- Data Fetching & Submission Logic ---
  const fetchInventory = async () => {
    if (!activeKopdesId) return;
    try {
      const res = await fetch(`/api/panen?kopdesId=${activeKopdesId}`);
      const data = await res.json();
      if (!res.ok) throw new Error("Gagal mengambil data inventory");
      setPendingHarvests(data.pending || []);
      setWarehouseBatches(data.warehouse || []);
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
      toast.error(err.message || "Gagal memuat data inventory");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeKopdesId]);

  // admin atur tgl penjemputan armada
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleHarvest) return;
    try {
      const res = await fetch(`/api/panen/${scheduleHarvest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickupScheduledAt: scheduledDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengatur jadwal");
      toast.success("Jadwal penjemputan berhasil disimpan!");
      setIsScheduleOpen(false);
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // admin input pin penjemputan
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinHarvest) return;
    try {
      const res = await fetch(`/api/panen/${pinHarvest.id}/validate-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "PIN tidak cocok");
      toast.success("PIN valid! Status berubah ke QC In Progress.");
      setIsPinOpen(false);
      setPinInput("");
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleQcSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedHarvest || !activeKopdesId) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      type: selectedHarvest.type,
      kopdesId: activeKopdesId,
      panenList: [
        {
          panenId: selectedHarvest.id,
          actualWeight: Number(formData.get("actualWeight")),
          grade: formData.get("grade") as string,
          moisture: Number(formData.get("moisture")) || 0,
          basePricePerKg: Number(formData.get("basePricePerKg")) || 0,
        },
      ],
    };

    try {
      const res = await fetch("/api/qc-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses QC");

      setIsQcDialogOpen(false);
      toast.success(`QC untuk ${selectedHarvest.farmerName} berhasil!`);
      await fetchInventory();
    } catch (error: any) {
      console.error("QC Error:", error);
      toast.error(error.message || "Terjadi kesalahan saat memproses QC");
    }
  };

  const handleProcessQcClick = (harvest: Harvest) => {
    setSelectedHarvest(harvest);
    setIsQcDialogOpen(true);
  };

  const handleViewQrClick = (batch: Batch) => {
    setSelectedBatchForQR(batch);
    setIsQrDialogOpen(true);
  };

  if (!activeKopdesId) {
    return (
      <div className="flex h-[80vh] items-center justify-center font-['Quicksand',sans-serif] bg-white">
        <div className="text-center p-8 border border-gray-200 rounded-md max-w-md">
          <Warehouse className="mx-auto h-12 w-12 text-[#606C38]" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Pilih Kopdes Terlebih Dahulu</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Silakan pilih Kopdes aktif dari header untuk melihat data inventaris stok & QC.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 bg-[#FFFFFF] min-h-screen font-['Quicksand',sans-serif]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#606C38]/10 text-[#606C38]">
              <Warehouse className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Inventaris & Penjemputan
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Atur jadwal penjemputan armada Kopdes, konfirmasi PIN penyerahan, dan verifikasi mutu (QC).
          </p>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-white border border-gray-200 rounded-md shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Pending QC & Penjemputan
            </CardTitle>
            <span className="p-1.5 rounded-md bg-[#DDA15E]/15 text-[#BC6C25]">
              <Weight className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900">
              {totalPendingQc.toLocaleString()} kg
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              {pendingHarvests.length} entri panen di antrean
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-md shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total In Warehouse
            </CardTitle>
            <span className="p-1.5 rounded-md bg-[#606C38]/10 text-[#606C38]">
              <Boxes className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900">
              {totalInWarehouse.toLocaleString()} kg
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              {warehouseBatches.length} batch kargo tersimpan
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-md shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Kapasitas Gudang
            </CardTitle>
            <span className="p-1.5 rounded-md bg-[#283618]/10 text-[#283618]">
              <HardDrive className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-extrabold text-gray-900">
                {capacityPercentage.toFixed(1)}%
              </div>
              <span className="text-xs font-semibold text-gray-500">
                Max {warehouseCapacity.toLocaleString()} kg
              </span>
            </div>
            <Progress value={capacityPercentage} className="mt-2.5 h-2 bg-gray-100" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending-qc" className="space-y-4">
        <TabsList className="bg-gray-100/80 p-1 border border-gray-200 rounded-md">
          <TabsTrigger
            value="pending-qc"
            className="data-[state=active]:bg-white data-[state=active]:text-[#606C38] data-[state=active]:shadow-none font-bold text-xs px-4 py-2 rounded-sm transition-all"
          >
            Antrean Penjemputan & QC ({pendingHarvests.length})
          </TabsTrigger>
          <TabsTrigger
            value="in-warehouse"
            className="data-[state=active]:bg-white data-[state=active]:text-[#606C38] data-[state=active]:shadow-none font-bold text-xs px-4 py-2 rounded-sm transition-all"
          >
            In Warehouse ({warehouseBatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending-qc">
          <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Nama Petani
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Komoditas & Berat
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Jadwal Penjemputan
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Status Tahapan
                    </TableHead>
                    <TableHead className="text-right text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingHarvests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-28 text-center text-sm font-medium text-gray-400">
                        Tidak ada entri panen yang menunggu penjemputan atau proses QC.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingHarvests.map((harvest) => (
                      <TableRow
                        key={harvest.id}
                        className="border-b border-gray-100 odd:bg-white even:bg-[#FEFAE0]/10 hover:bg-gray-50/80 transition-colors"
                      >
                        <TableCell className="font-bold text-gray-900 text-sm">
                          <div>{harvest.farmerName}</div>
                          <div className="text-[11px] text-gray-400 font-normal">{harvest.farmerPhone}</div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-gray-700">
                          <span className="font-bold text-gray-900">{harvest.type}</span> — {harvest.declaredWeight.toFixed(1)} kg
                        </TableCell>
                        <TableCell className="text-xs font-medium text-gray-600">
                          {harvest.pickupScheduledAt ? (
                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-[11px] shadow-none">
                              {new Date(harvest.pickupScheduledAt).toLocaleDateString("id-ID")}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 italic">Belum Dijadwalkan</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {harvest.status === "QC_IN_PROGRESS" ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-[10px] shadow-none">
                              Siap Diproses QC
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-800 border-amber-300 bg-amber-50 font-bold text-[10px] shadow-none">
                              {harvest.status === "PENDING_PICKUP" ? "Menunggu Penjemputan" : "Menunggu Setor Mandiri"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {harvest.status === "PENDING_PICKUP" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold text-xs rounded-md shadow-none px-2.5 py-1"
                                onClick={() => {
                                  setScheduleHarvest(harvest);
                                  setScheduledDate(
                                    harvest.pickupScheduledAt
                                      ? new Date(harvest.pickupScheduledAt).toISOString().split("T")[0]
                                      : ""
                                  );
                                  setIsScheduleOpen(true);
                                }}
                              >
                                <Calendar className="mr-1 h-3.5 w-3.5 text-amber-600" />
                                Jadwalkan
                              </Button>
                            )}

                            {(harvest.status === "PENDING_PICKUP" || harvest.status === "PENDING_DROPOFF") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#606C38] text-[#606C38] hover:bg-[#606C38]/10 font-semibold text-xs rounded-md shadow-none px-2.5 py-1"
                                onClick={() => {
                                  setPinHarvest(harvest);
                                  setIsPinOpen(true);
                                }}
                              >
                                <KeyRound className="mr-1 h-3.5 w-3.5" />
                                Validasi PIN
                              </Button>
                            )}

                            {harvest.status === "QC_IN_PROGRESS" && (
                              <Button
                                size="sm"
                                className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold text-xs rounded-md shadow-none px-3 py-1.5"
                                onClick={() => handleProcessQcClick(harvest)}
                              >
                                <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
                                Proses QC
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="in-warehouse">
          <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Batch ID
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Komoditas
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Berat Total
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Grade QC
                    </TableHead>
                    <TableHead className="text-right text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Aksi Traceability
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouseBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-28 text-center text-sm font-medium text-gray-400">
                        Belum ada batch kargo tersimpan di gudang.
                      </TableCell>
                    </TableRow>
                  ) : (
                    warehouseBatches.map((batch) => (
                      <TableRow
                        key={batch.id}
                        className="border-b border-gray-100 odd:bg-white even:bg-[#FEFAE0]/10 hover:bg-gray-50/80 transition-colors"
                      >
                        <TableCell className="font-mono text-xs font-semibold text-gray-700">
                          {batch.id}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-gray-800">
                          {batch.type}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900">
                          {batch.totalWeight.toFixed(1)} kg
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-[#606C38]/30 bg-[#606C38]/10 text-[#606C38] font-bold text-xs"
                          >
                            Grade {batch.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewQrClick(batch)}
                            className="border-gray-300 text-gray-700 font-semibold text-xs rounded-md shadow-none hover:bg-gray-50 px-3 py-1.5"
                          >
                            <QrCode className="h-3.5 w-3.5 mr-1.5 text-[#606C38]" />
                            Lihat QR Code
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- Dialog 1: Jadwalkan Penjemputan --- */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-md font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" /> Atur Jadwal Penjemputan
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-medium">
              Pilih tanggal penjemputan armada Kopdes ke lokasi petani ({scheduleHarvest?.farmerName}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Tanggal Penjemputan</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="h-10 text-xs font-semibold rounded-md border-gray-300"
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsScheduleOpen(false)} className="text-xs font-bold">
                Batal
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-none">
                Simpan Jadwal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Dialog 2: Validasi PIN --- */}
      <Dialog open={isPinOpen} onOpenChange={setIsPinOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-md font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#606C38]" /> Validasi PIN Penyerahan
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-medium">
              Masukkan 6-digit PIN penyerahan dari HP petani ({pinHarvest?.farmerName}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePinSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">6-Digit PIN Penyerahan</Label>
              <Input
                type="text"
                placeholder="Contoh: 884219"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="h-11 text-center text-lg tracking-widest font-extrabold rounded-md border-gray-300"
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPinOpen(false)} className="text-xs font-bold">
                Batal
              </Button>
              <Button type="submit" className="bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold shadow-none">
                Konfirmasi & Lanjut QC
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Dialog 3 & 4: QC & QR --- */}
      <QcDialog
        isOpen={isQcDialogOpen}
        onOpenChange={setIsQcDialogOpen}
        harvest={selectedHarvest}
        onSubmit={handleQcSubmit}
      />
      <QrDialog
        isOpen={isQrDialogOpen}
        onOpenChange={setIsQrDialogOpen}
        batch={selectedBatchForQR}
      />
    </motion.div>
  );
}

// --- Sub-components ---

const QcDialog = ({
  isOpen,
  onOpenChange,
  harvest,
  onSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  harvest: Harvest | null;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-gray-900">Proses Quality Control</DialogTitle>
        <DialogDescription className="text-xs font-medium text-gray-500">
          Input penimbangan aktual dan grade mutu panen dari{" "}
          <span className="font-bold text-gray-800">
            {harvest?.farmerName}
          </span>
          .
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="actualWeight" className="text-xs font-bold text-gray-700">
              Berat Penimbangan Timbangan (kg)
            </Label>
            <Input
              id="actualWeight"
              name="actualWeight"
              type="number"
              step="0.1"
              placeholder="Contoh: 450.5"
              required
              className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grade" className="text-xs font-bold text-gray-700">
              Hasil Klasifikasi Grade Mutu
            </Label>
            <Select name="grade" required>
              <SelectTrigger className="border-gray-300 focus:ring-[#606C38] rounded-md text-sm">
                <SelectValue placeholder="Pilih grade mutu..." />
              </SelectTrigger>
              <SelectContent className="font-['Quicksand',sans-serif]">
                <SelectItem value="A">Grade A (Super Quality)</SelectItem>
                <SelectItem value="B">Grade B (Standard)</SelectItem>
                <SelectItem value="C">Grade C (Industrial)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 text-gray-700 rounded-md text-sm shadow-none"
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="bg-[#606C38] hover:bg-[#283618] text-white rounded-md text-sm font-semibold shadow-none"
          >
            Simpan & Proses QC
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

const QrDialog = ({
  isOpen,
  onOpenChange,
  batch,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  batch: Batch | null;
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]">
      <DialogHeader className="text-center">
        <DialogTitle className="text-lg font-bold text-gray-900">
          Sertifikat ESG Traceability
        </DialogTitle>
        <DialogDescription className="text-xs font-medium text-gray-500">
          Pindai QR code untuk memverifikasi asal-usul & riwayat lengkap batch ini.
        </DialogDescription>
      </DialogHeader>
      {batch && (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50/50 border border-gray-100 rounded-md my-2">
          <QRCodeSVG
            value={`https://coconeed.com/certificate/${batch.id}`}
            size={200}
            className="p-2 bg-white border border-gray-200 rounded-md"
          />
          <p className="mt-4 text-xs font-mono font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1 rounded-md">
            Batch ID: {batch.id}
          </p>
        </div>
      )}
      <DialogFooter className="sm:justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="border-gray-300 text-gray-700 rounded-md text-sm font-semibold shadow-none px-6"
        >
          Tutup
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
