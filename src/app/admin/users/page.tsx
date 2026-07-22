"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Users,
  UserCheck,
  UserX,
  FileText,
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AutoVerifySwitch } from "@/components/admin/AutoVerifySwitch"; // DIKEMBALIKAN
import { useState, useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { registerSchema } from "@/lib/validations/register.schema";

const getInitials = (name: string) => {
  const safeName = name || "Unknown";
  const names = safeName.split(" ");
  if (names.length > 1 && names[0] && names[1]) {
    return `${names[0][0]}${names[1][0]}`;
  }
  return safeName.substring(0, 2);
};

const editFarmerSchema = registerSchema.omit({ pin: true }).extend({
  isVerified: z.boolean().optional(),
});

type Kopdes = {
  id: string;
  name: string;
};

type Farmer = {
  id: string;
  name: string;
  phoneNumber: string;
  isVerified: boolean;
  ecoPoints: number;
  harvests?: number;
  kopdes: Kopdes | null;
};

type RegisterFormValues = z.infer<typeof registerSchema>;
type EditFormValues = z.infer<typeof editFarmerSchema>;

export default function PetaniManagementPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [allKopdes, setAllKopdes] = useState<Kopdes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);

  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [selectedKopdesId, setSelectedKopdesId] = useState<string | null>(null);

  const {
    control: controlAdd,
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
    reset: resetAdd,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      pin: "",
      kopdesId: "", // Ganti menjadi string kosong
    },
  });

  const {
    control: controlEdit,
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<EditFormValues>({
    resolver: zodResolver(editFarmerSchema),
  });

  useEffect(() => {
    if (selectedFarmer && isEditDialogOpen) {
      setEditValue("name", selectedFarmer.name);
      setEditValue("phoneNumber", selectedFarmer.phoneNumber);
      setEditValue("isVerified", selectedFarmer.isVerified);
      setEditValue("kopdesId", selectedFarmer.kopdes?.id || "");
    }
  }, [selectedFarmer, isEditDialogOpen, setEditValue]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [farmersRes, kopdesRes] = await Promise.all([
        fetch("/api/users?role=PETANI"),
        fetch("/api/kopdes"),
      ]);

      const farmersResponseData = await farmersRes.json();
      const kopdesResponseData = await kopdesRes.json();

      setFarmers(
        Array.isArray(farmersResponseData.data) ? farmersResponseData.data : [],
      );
      setAllKopdes(
        Array.isArray(kopdesResponseData.data) ? kopdesResponseData.data : [],
      );
    } catch (err) {
      console.error("Gagal menarik data", err);
      toast.error("Gagal memuat data awal.");
      setFarmers([]);
      setAllKopdes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFarmers = async () => {
    try {
      const res = await fetch("/api/users?role=PETANI");
      const responseData = await res.json();
      setFarmers(Array.isArray(responseData.data) ? responseData.data : []);
    } catch (err) {
      console.error("Gagal merefresh data petani:", err);
      toast.error("Gagal merefresh data petani.");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreateFarmer: SubmitHandler<RegisterFormValues> = async (
    data,
  ) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal membuat akun petani.");
      }
      toast.success("Akun petani berhasil dibuat!");
      resetAdd({ name: "", phoneNumber: "", pin: "", kopdesId: "" });
      setIsAddDialogOpen(false);
      refreshFarmers();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleUpdateFarmer: SubmitHandler<EditFormValues> = async (data) => {
    if (!selectedFarmer) return;
    try {
      const res = await fetch(`/api/users/${selectedFarmer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memperbarui data petani.");
      }
      toast.success("Data petani berhasil diperbarui!");
      resetEdit();
      setIsEditDialogOpen(false);
      refreshFarmers();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleVerify = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsVerifyDialogOpen(true);
  };

  const handleConfirmVerification = async () => {
    if (!selectedFarmer || !selectedKopdesId) {
      toast.error("Silakan pilih Kopdes terlebih dahulu.");
      return;
    }
    try {
      const res = await fetch(`/api/users/${selectedFarmer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: true, kopdesId: selectedKopdesId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memverifikasi petani.");
      }
      toast.success("Petani berhasil diverifikasi!");
      refreshFarmers();
      setIsVerifyDialogOpen(false);
      setSelectedKopdesId(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const confirmDelete = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedFarmer) return;
    try {
      const res = await fetch(`/api/users/${selectedFarmer.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menghapus petani.");
      }
      toast.success(`Akun untuk ${selectedFarmer.name} berhasil dihapus.`);
      refreshFarmers();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleViewDetails = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsDetailSheetOpen(true);
  };
  const handleEdit = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsEditDialogOpen(true);
  };

  const safeFarmers = Array.isArray(farmers) ? farmers : [];
  const filteredFarmers = safeFarmers.filter((farmer) => {
    const matchSearch =
      farmer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.phoneNumber?.includes(searchQuery);
    const matchLocation =
      filterLocation === "all" || farmer.kopdes?.id === filterLocation;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "verified" ? farmer.isVerified : !farmer.isVerified);
    return matchSearch && matchLocation && matchStatus;
  });

  const totalFarmers = safeFarmers.length;
  const pendingVerification = safeFarmers.filter((f) => !f.isVerified).length;
  const verifiedFarmers = safeFarmers.filter((f) => f.isVerified).length;

  return (
    <>
      <div className="flex flex-col gap-6 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Manajemen Petani
          </h1>
          <div className="flex items-center gap-4">
            <AutoVerifySwitch /> {/* DIKEMBALIKAN */}
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Petani
            </Button>
          </div>
        </div>

        {/* --- DIALOGS --- */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmitAdd(handleCreateFarmer)}>
              <DialogHeader>
                <DialogTitle>Buat Akun Petani Baru</DialogTitle>
                <DialogDescription>
                  Status verifikasi petani baru akan mengikuti pengaturan
                  Auto-Verify.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="add-name" className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="add-name"
                    {...registerAdd("name")}
                    className="col-span-3"
                  />
                  {errorsAdd.name && (
                    <p className="col-span-4 text-xs text-red-500 text-right">
                      {errorsAdd.name.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="add-phoneNumber" className="text-right">
                    No. HP
                  </Label>
                  <Input
                    id="add-phoneNumber"
                    {...registerAdd("phoneNumber")}
                    className="col-span-3"
                    placeholder="+62812..."
                  />
                  {errorsAdd.phoneNumber && (
                    <p className="col-span-4 text-xs text-red-500 text-right">
                      {errorsAdd.phoneNumber.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="add-pin" className="text-right">
                    PIN
                  </Label>
                  <Input
                    id="add-pin"
                    type="password"
                    {...registerAdd("pin")}
                    className="col-span-3"
                    maxLength={6}
                  />
                  {errorsAdd.pin && (
                    <p className="col-span-4 text-xs text-red-500 text-right">
                      {errorsAdd.pin.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="add-kopdes" className="text-right">
                    Kopdes
                  </Label>
                  <Controller
                    name="kopdesId"
                    control={controlAdd}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Pilih Kopdes...">
                            {field.value
                              ? allKopdes.find((k) => k.id === field.value)
                                  ?.name
                              : "Pilih Kopdes..."}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {allKopdes.map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errorsAdd.kopdesId && (
                    <p className="col-span-4 text-xs text-red-500 text-right">
                      {errorsAdd.kopdesId.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmittingAdd}>
                  {isSubmittingAdd ? "Menyimpan..." : "Simpan Akun"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmitEdit(handleUpdateFarmer)}>
              <DialogHeader>
                <DialogTitle>Edit Data Petani</DialogTitle>
                <DialogDescription>
                  Perbarui detail petani di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="edit-name"
                    {...registerEdit("name")}
                    className="col-span-3"
                  />
                  {errorsEdit.name && (
                    <p className="col-span-4 text-xs text-red-500 text-right">
                      {errorsEdit.name.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phoneNumber" className="text-right">
                    No. HP
                  </Label>
                  <Input
                    id="edit-phoneNumber"
                    {...registerEdit("phoneNumber")}
                    className="col-span-3"
                    placeholder="+62812..."
                  />
                  {errorsEdit.phoneNumber && (
                    <p className="col-span-4 text-xs text-red-500 text-right">
                      {errorsEdit.phoneNumber.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-kopdes" className="text-right">
                    Kopdes
                  </Label>
                  <Controller
                    name="kopdesId"
                    control={controlEdit}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Pilih Kopdes...">
                            {field.value
                              ? allKopdes.find((k) => k.id === field.value)
                                  ?.name
                              : "Tidak ada"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tidak ada</SelectItem>
                          {allKopdes.map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isVerified" className="text-right">
                    Terverifikasi
                  </Label>
                  <Controller
                    name="isVerified"
                    control={controlEdit}
                    render={({ field }) => (
                      <Switch
                        id="isVerified"
                        className="col-span-3"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmittingEdit}>
                  {isSubmittingEdit ? "Memperbarui..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Apakah Anda benar-benar yakin?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus akun petani secara permanen dari
                server.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Lanjutkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verifikasi & Pilih Kopdes</DialogTitle>
              <DialogDescription>
                Pilih Kopdes untuk petani{" "}
                <span className="font-bold">{selectedFarmer?.name}</span> untuk
                menyelesaikan verifikasi.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="kopdes-select">Koperasi Desa</Label>
              <Select
                onValueChange={setSelectedKopdesId}
                value={selectedKopdesId || ""}
              >
                <SelectTrigger id="kopdes-select">
                  <SelectValue placeholder="Pilih Kopdes...">
                    {selectedKopdesId
                      ? allKopdes.find((k) => k.id === selectedKopdesId)?.name
                      : "Pilih Kopdes..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allKopdes.map((kopdes) => (
                    <SelectItem key={kopdes.id} value={kopdes.id}>
                      {kopdes.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsVerifyDialogOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleConfirmVerification}>
                Konfirmasi Verifikasi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* --- DASHBOARD CARDS & TABLE --- */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Petani
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFarmers}</div>
              <p className="text-xs text-muted-foreground">
                Total petani terdaftar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Verifikasi Tertunda
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingVerification}</div>
              <p className="text-xs text-muted-foreground">
                Membutuhkan tindakan Anda
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Petani Terverifikasi
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedFarmers}</div>
              <p className="text-xs text-muted-foreground">
                Total petani aktif
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari nama atau no. HP..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={filterLocation}
                onValueChange={(value) => setFilterLocation(value ?? "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lokasi / Kopdes">
                    {filterLocation === "all"
                      ? "Semua Lokasi"
                      : allKopdes.find((k) => k.id === filterLocation)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Lokasi</SelectItem>
                  {allKopdes.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value ?? "all")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Nama Petani</TableHead>
                    <TableHead>No. HP</TableHead>
                    <TableHead>Asal Kopdes</TableHead>
                    <TableHead>Status KYC</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredFarmers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Tidak ada data petani yang cocok.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFarmers.map((farmer) => (
                      <TableRow key={farmer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(farmer.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{farmer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{farmer.phoneNumber}</TableCell>
                        <TableCell>
                          {farmer.kopdes?.name || "Belum diatur"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              farmer.isVerified ? "default" : "secondary"
                            }
                            className={
                              farmer.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {farmer.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!farmer.isVerified && (
                              <Button
                                size="sm"
                                onClick={() => handleVerify(farmer)}
                              >
                                Verifikasi
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger className="flex items-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(farmer)}
                                >
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(farmer)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => confirmDelete(farmer)}
                                  className="text-red-600"
                                >
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedFarmer && (
            <>
              <SheetHeader>
                <SheetTitle>Detail Petani</SheetTitle>
                <SheetDescription>
                  Informasi lengkap mengenai {selectedFarmer.name}.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-3xl">
                    {getInitials(selectedFarmer.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-2xl font-semibold">
                  {selectedFarmer.name}
                </h2>
                <p className="text-muted-foreground">
                  {selectedFarmer.phoneNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedFarmer.kopdes?.name || "Kopdes belum diatur"}
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Panen
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedFarmer.harvests || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Poin Eco
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedFarmer.ecoPoints}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
