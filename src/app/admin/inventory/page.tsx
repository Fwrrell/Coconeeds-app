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
  DialogTrigger,
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
  QrCode,
  Cog,
  Weight,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { toast } from "sonner";

type Harvest = {
  id: string;
  date: string;
  farmerName: string;
  type: string;
  declaredWeight: number;
  status: string;
};

type Batch = {
  id: string;
  type: string;
  totalWeight: number;
  grade: string;
  dateProcessed: string;
  status: string;
};

export default function InventoryManagementPage() {
  const { activeKopdesId } = useAdminStore();
  const [pendingHarvests, setPendingHarvests] = useState<Harvest[]>([]);
  const [warehouseBatches, setWarehouseBatches] = useState<Batch[]>([]);
  const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);
  const [isQcDialogOpen, setIsQcDialogOpen] = useState(false);
  const [selectedBatchForQR, setSelectedBatchForQR] = useState<Batch | null>(
    null,
  );
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

  const totalPendingQc = pendingHarvests.reduce(
    (acc, h) => acc + h.declaredWeight,
    0,
  );
  const totalInWarehouse = warehouseBatches.reduce(
    (acc, b) => acc + b.totalWeight,
    0,
  );
  const warehouseCapacity = 10000;
  const capacityPercentage = (totalInWarehouse / warehouseCapacity) * 100;

  const fetchInventory = async () => {
    if (!activeKopdesId) return;

    try {
      const res = await fetch(`/api/panen?kopdesId=${activeKopdesId}`);

      const data = await res.json();
      if (!res.ok) {
        throw new Error("Gagal mengambil data inventory");
      }

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

  const handleProcessQcClick = (harvest: Harvest) => {
    setSelectedHarvest(harvest);
    setIsQcDialogOpen(true);
  };

  const handleQcSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedHarvest || !activeKopdesId) return;

    const formData = new FormData(event.currentTarget);
    const actualWeight = Number(formData.get("actualWeight"));
    const grade = formData.get("grade");
    const moisture = Number(formData.get("moisture"));
    const basePricePerKg = Number(formData.get("basePricePerKg"));

    try {
      const payload = {
        type: selectedHarvest.type,
        kopdesId: activeKopdesId,
        panenList: [
          {
            panenId: selectedHarvest.id,
            actualWeight: actualWeight,
            grade: grade,
            moisture: moisture,
            basePricePerKg: basePricePerKg,
          },
        ],
      };

      const res = await fetch("/api/qc-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses QC");
      }

      setIsQcDialogOpen(false);
      toast.success(
        `QC untuk ${selectedHarvest.farmerName} berhasil! Batch dan Hash Ledger telah dibuat.`,
      );

      // Trigger re-fetch data agar tabel otomatis ter-update
      await fetchInventory();
    } catch (error: any) {
      console.error("QC Error:", error);
      toast.error(error.message || "Terjadi kesalahan saat memproses QC");
    }
  };

  if (!activeKopdesId) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Warehouse className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">
            Pilih Kopdes Terlebih Dahulu
          </h2>
          <p className="mt-2 text-muted-foreground">
            Silakan pilih Kopdes dari dropdown di header untuk melihat data
            inventaris.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 md:px-6 py-4">
      <h1 className="text-2xl font-bold tracking-tight">Manajemen Inventory</h1>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pending QC
            </CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPendingQc.toLocaleString()} kg
            </div>
            <p className="text-xs text-muted-foreground">
              Total berat deklarasi dari petani
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total In Warehouse
            </CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInWarehouse.toLocaleString("en-US", {
                maximumFractionDigits: 1,
              })}{" "}
              kg
            </div>
            <p className="text-xs text-muted-foreground">
              Total berat aktual di gudang
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kapasitas Gudang
            </CardTitle>
            <Cog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInWarehouse.toLocaleString("en-US", {
                maximumFractionDigits: 1,
              })}{" "}
              / {warehouseCapacity.toLocaleString()} kg
            </div>
            <Progress value={capacityPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Tabs */}
      <Tabs defaultValue="pending-qc">
        <TabsList>
          <TabsTrigger value="pending-qc">
            Pending QC ({pendingHarvests.length})
          </TabsTrigger>
          <TabsTrigger value="in-warehouse">
            In Warehouse ({warehouseBatches.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending QC */}
        <TabsContent value="pending-qc">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Calendar className="inline-block h-4 w-4 mr-1" />
                      Tanggal
                    </TableHead>
                    <TableHead>
                      <User className="inline-block h-4 w-4 mr-1" />
                      Nama Petani
                    </TableHead>
                    <TableHead>
                      <Tag className="inline-block h-4 w-4 mr-1" />
                      Tipe
                    </TableHead>
                    <TableHead>
                      <Weight className="inline-block h-4 w-4 mr-1" />
                      Berat Deklarasi
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingHarvests.map((harvest) => (
                    <TableRow key={harvest.id}>
                      <TableCell>
                        {new Date(harvest.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {harvest.farmerName}
                      </TableCell>
                      <TableCell>{harvest.type}</TableCell>
                      <TableCell>{harvest.declaredWeight} kg</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          {harvest.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleProcessQcClick(harvest)}
                        >
                          Process QC
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: In Warehouse */}
        <TabsContent value="in-warehouse">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Berat Aktual Total</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Tgl. Proses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouseBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono">{batch.id}</TableCell>
                      <TableCell>{batch.type}</TableCell>
                      <TableCell>
                        {batch.totalWeight.toLocaleString("en-US", {
                          maximumFractionDigits: 1,
                        })}{" "}
                        kg
                      </TableCell>
                      <TableCell className="font-medium">
                        {batch.grade}
                      </TableCell>
                      <TableCell>
                        {new Date(batch.dateProcessed).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBatchForQR(batch);
                            setIsQrDialogOpen(true);
                          }}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          View QR
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

      {/* Dialog untuk Proses QC */}
      <Dialog open={isQcDialogOpen} onOpenChange={setIsQcDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proses Quality Control</DialogTitle>
            <DialogDescription>
              Input berat aktual dan grade untuk panen dari{" "}
              <span className="font-bold">{selectedHarvest?.farmerName}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQcSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="actualWeight" className="text-right">
                  Berat Aktual (kg)
                </Label>
                <Input
                  id="actualWeight"
                  name="actualWeight"
                  type="number"
                  step="0.1"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right">
                  Grade Kualitas
                </Label>
                <Select name="grade" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih grade..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A (Super)</SelectItem>
                    <SelectItem value="B">Grade B (Baik)</SelectItem>
                    <SelectItem value="C">Grade C (Standar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Submit QC & Generate Batch</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog untuk menampilkan QR Traceability */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-center">
              Sertifikat ESG Traceability
            </DialogTitle>
            <DialogDescription className="text-center">
              Cetak dan tempelkan QR Code ini pada kontainer / karung batch
              kargo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border-2 border-dashed mt-2">
            {selectedBatchForQR && (
              <>
                <QRCodeSVG
                  value={`https://localhost:3000/certificate/${selectedBatchForQR.id}`}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"Q"} // Quality level Q (25% error correction)
                  includeMargin={false}
                />
                <p className="mt-6 text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  {selectedBatchForQR.id}
                </p>
                <div className="mt-2 text-xs font-semibold text-primary">
                  {selectedBatchForQR.type} • Grade {selectedBatchForQR.grade} •{" "}
                  {selectedBatchForQR.totalWeight} kg
                </div>
              </>
            )}
          </div>

          <DialogFooter className="sm:justify-center mt-2">
            <Button
              type="button"
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => window.print()}
            >
              Cetak Label QR
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsQrDialogOpen(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
