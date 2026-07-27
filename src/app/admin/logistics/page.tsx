"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Anchor,
  Bot,
  Boxes,
  CheckCircle,
  Rocket,
  Ship,
  Truck,
} from "lucide-react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

type ShipmentStatus = "WAITING_DEPARTURE" | "IN_TRANSIT" | "ARRIVED";

export default function LogisticsManagementPage() {
  const { activeKopdesId } = useAdminStore();

  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);

  const [isAiRunning, setIsAiRunning] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [showAiResult, setShowAiResult] = useState(false);

  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  // Periksa jika admin sedang melihat secara global atau spesifik
  const isGlobalView = activeKopdesId === "ALL";

  const fetchLogistics = async () => {
    if (!activeKopdesId) return;
    try {
      const res = await fetch(`/api/pengiriman?kopdesId=${activeKopdesId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal memuat data logistik");

      setAvailableBatches(data.availableBatches || []);
      setShipments(data.shipments || []);
    } catch (error: any) {
      console.error("Logistics Fetch Error:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchLogistics();
  }, [activeKopdesId]);

  useEffect(() => {
    console.log(
      `View mode: ${isGlobalView ? "Global" : `Kopdes ID ${activeKopdesId}`}`,
    );
  }, [activeKopdesId, isGlobalView]);

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

  const handleConfirmShipment = async () => {
    if (availableBatches.length === 0) {
      toast.error("Tidak ada batch yang tersedia untuk dikirim.");
      return;
    }

    const batchIdsToShip = availableBatches.map((b) => b.id);
    const totalWeightToShip = availableBatches.reduce(
      (acc, curr) => acc + curr.weight,
      0,
    );

    try {
      // TODO: Payload ini didapat dari AI
      const payload = {
        namaKapal: "KM Logistik Nusantara 4",
        rute: "Kopdes Merah Putih - Surabaya",
        totalBiaya: 15000000,
        batchIds: batchIdsToShip,
      };

      const res = await fetch("/api/pengiriman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pengiriman");
      }

      toast.success("Pengiriman dan Split Bill berhasil dibuat!");
      setShowAiResult(false);

      await fetchLogistics();
    } catch (error: any) {
      console.error("Shipment Error:", error);
      toast.error(error.message || "Terjadi kesalahan sistem");
    }
  };

  const handleUpdateStatus = (shipment: (typeof shipments)[0]) => {
    setSelectedShipment(shipment);
    setNewStatus(shipment.status);
    setIsUpdateStatusOpen(true);
  };

  const saveStatusUpdate = async () => {
    if (!selectedShipment || !newStatus) return;

    try {
      const res = await fetch("/api/pengiriman", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: selectedShipment.id,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update status");

      toast.success(`Status kapal berhasil diubah menjadi ${newStatus}.`);
      setIsUpdateStatusOpen(false);

      await fetchLogistics();
    } catch (error: any) {
      console.error("Update Status Error:", error);
      toast.error(error.message);
    }
  };

  // Fallback UI jika tidak ada Kopdes yang dipilih dan bukan global view
  if (!activeKopdesId) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">
            Pilih Kopdes Terlebih Dahulu
          </h2>
          <p className="mt-2 text-muted-foreground">
            Silakan pilih Kopdes dari header untuk melihat data logistik
            spesifik.
          </p>
        </div>
      </div>
    );
  }

  const totalCargoGrouped = 6500;
  const kopdesACargo = 1398.7;
  const kopdesBCargo = 5101.3;
  const kopdesAPercentage = (kopdesACargo / totalCargoGrouped) * 100;
  const kopdesBPercentage = (kopdesBCargo / totalCargoGrouped) * 100;

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Manajemen Logistik & Pengiriman
        </h1>
        <p className="text-muted-foreground">
          Kelola pengiriman kargo dan gunakan AI untuk efisiensi rute & biaya.
        </p>
      </div>
      <Separator />

      <Tabs defaultValue="ai-pooling">
        <TabsList>
          <TabsTrigger value="ai-pooling">AI Cargo Pooling</TabsTrigger>
          <TabsTrigger value="active-shipments">
            Active Shipments ({shipments.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: AI CARGO POOLING */}
        <TabsContent value="ai-pooling" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Bot size={28} />
              </div>
              <div>
                <CardTitle>Optimalkan Pengiriman Anda</CardTitle>
                <CardDescription>
                  Gunakan AI untuk menganalisa dan mengelompokkan batch yang
                  siap kirim ke dalam satu kontainer/kapal untuk efisiensi
                  maksimal.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={runAiPooling} disabled={isAiRunning}>
                <Rocket className="mr-2 h-4 w-4" />
                {isAiRunning
                  ? "AI sedang menganalisa..."
                  : "✨ Jalankan AI Cargo Pooling"}
              </Button>
              {isAiRunning && (
                <Progress value={aiProgress} className="w-[60%] mt-4" />
              )}
            </CardContent>
          </Card>

          {showAiResult && (
            <Card className="bg-gradient-to-br from-green-50 to-cyan-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" />
                  Rekomendasi AI Ditemukan!
                </CardTitle>
                <CardDescription>
                  AI merekomendasikan penggabungan beberapa batch untuk
                  pengiriman berikut:
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Detail Pengiriman</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                    <span className="text-sm text-muted-foreground">
                      Saran Kapal
                    </span>
                    <span className="font-bold flex items-center gap-2">
                      <Ship size={16} /> KM Logistik Nusantara 4
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                    <span className="text-sm text-muted-foreground">
                      Total Kargo Tergabung
                    </span>
                    <span className="font-bold">6.5 Ton</span>
                  </div>
                  <Button onClick={handleConfirmShipment} className="w-full">
                    Konfirmasi & Buat Pengiriman
                  </Button>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Kalkulasi Split Bill</h3>
                  <div className="p-3 rounded-lg bg-background space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span>Kopdes Merah Putih</span>
                      <span className="text-muted-foreground">
                        {kopdesACargo.toLocaleString()} kg
                      </span>
                      <Badge variant="secondary">
                        {kopdesAPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Kopdes Jaya Bersama</span>
                      <span className="text-muted-foreground">
                        {kopdesBCargo.toLocaleString()} kg
                      </span>
                      <Badge variant="secondary">
                        {kopdesBPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Biaya akan dibagi berdasarkan persentase berat kargo dari
                    total muatan.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes size={20} /> Batch Siap Kirim
              </CardTitle>
              <CardDescription>
                Daftar batch yang sudah lolos QC dan siap untuk digabungkan
                dalam pengiriman.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Berat</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Tgl. Proses</TableHead>
                    <TableHead>Asal Kopdes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono">{batch.id}</TableCell>
                      <TableCell>{batch.type}</TableCell>
                      <TableCell>{batch.weight} kg</TableCell>
                      <TableCell>{batch.grade}</TableCell>
                      <TableCell>
                        {new Date(batch.dateProcessed).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{batch.originKopdes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ACTIVE SHIPMENTS */}
        <TabsContent value="active-shipments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck size={20} /> Pengiriman Aktif
              </CardTitle>
              <CardDescription>
                Lacak dan perbarui status semua pengiriman yang sedang berjalan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Nama Kapal</TableHead>
                    <TableHead>Rute</TableHead>
                    <TableHead>Total Berat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono">{shipment.id}</TableCell>
                      <TableCell className="font-medium">
                        {shipment.namaKapal}
                      </TableCell>
                      <TableCell>{shipment.rute}</TableCell>
                      <TableCell>
                        {(shipment.totalWeight / 1000).toFixed(1)} Ton
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            shipment.status === "ARRIVED"
                              ? "default"
                              : shipment.status === "IN_TRANSIT"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            shipment.status === "ARRIVED"
                              ? "bg-green-100 text-green-800"
                              : shipment.status === "IN_TRANSIT"
                                ? "bg-blue-100 text-blue-800"
                                : ""
                          }
                        >
                          {shipment.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(shipment)}
                        >
                          Update Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG UPDATE STATUS */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status Pengiriman</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p>
              ID Shipment:{" "}
              <span className="font-mono p-1 bg-muted rounded-md">
                {selectedShipment?.id}
              </span>
            </p>
            <Label htmlFor="status-select">Status Baru</Label>
            <Select
              defaultValue={selectedShipment?.status}
              onValueChange={(val) => setNewStatus(val)}
            >
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Pilih status baru..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WAITING_DEPARTURE">
                  Waiting Departure
                </SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={saveStatusUpdate}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
