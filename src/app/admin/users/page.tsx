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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  User,
  CheckCircle2,
  Edit2,
  Trash2,
  Eye,
  Building,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AutoVerifySwitch } from "@/components/admin/AutoVerifySwitch";
import { useState, useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { registerSchema } from "@/lib/validations/register.schema";
import { motion } from "framer-motion";

const getInitials = (name: string) => {
  const safeName = name || "Unknown";
  const names = safeName.split(" ");
  if (names.length > 1 && names[0] && names[1]) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return safeName.substring(0, 2).toUpperCase();
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
      kopdesId: "",
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
              <Users className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Pengguna Platform
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Kelola pendaftaran anggota petani, administrator platform, serta akun mitra perusahaan.
          </p>
        </div>
      </div>

      {/* Role Tabs Navigation */}
      <Tabs defaultValue="petani" className="space-y-6">
        <TabsList className="border-b border-gray-200 p-0 h-auto bg-transparent rounded-none flex gap-6">
          <TabsTrigger
            value="petani"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#606C38] data-[state=active]:text-[#606C38] rounded-none bg-transparent shadow-none font-bold text-xs uppercase tracking-wider px-1 pb-3 text-gray-500 transition-colors"
          >
            Petani ({totalFarmers})
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#606C38] data-[state=active]:text-[#606C38] rounded-none bg-transparent shadow-none font-bold text-xs uppercase tracking-wider px-1 pb-3 text-gray-500 transition-colors"
          >
            Admin Platform
          </TabsTrigger>
          <TabsTrigger
            value="perusahaan"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#606C38] data-[state=active]:text-[#606C38] rounded-none bg-transparent shadow-none font-bold text-xs uppercase tracking-wider px-1 pb-3 text-gray-500 transition-colors"
          >
            Mitra Perusahaan
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Petani (Full Working Backend Integration) */}
        <TabsContent value="petani" className="space-y-6 mt-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AutoVerifySwitch />
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold shadow-none rounded-md px-4 py-2 text-sm shrink-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Petani
            </Button>
          </div>

          {/* Metric Cards Bento Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-white border border-gray-200 rounded-md shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total Petani
                </CardTitle>
                <span className="p-1.5 rounded-md bg-[#606C38]/10 text-[#606C38]">
                  <Users className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-gray-900">{totalFarmers}</div>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  Petani terdaftar di platform
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-md shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Verifikasi Tertunda
                </CardTitle>
                <span className="p-1.5 rounded-md bg-[#DDA15E]/15 text-[#BC6C25]">
                  <UserX className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-gray-900">{pendingVerification}</div>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  Membutuhkan tindakan verifikasi
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-md shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Petani Terverifikasi
                </CardTitle>
                <span className="p-1.5 rounded-md bg-[#283618]/10 text-[#283618]">
                  <UserCheck className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-gray-900">{verifiedFarmers}</div>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  Petani aktif terverifikasi KYC
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Table Card */}
          <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Toolbar & Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Cari nama atau no. HP..."
                    className="pl-9 border-gray-200 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={filterLocation}
                    onValueChange={(value) => setFilterLocation(value ?? "all")}
                  >
                    <SelectTrigger className="w-[160px] border-gray-200 text-xs font-semibold rounded-md">
                      <SelectValue placeholder="Lokasi / Kopdes">
                        {filterLocation === "all"
                          ? "Semua Lokasi"
                          : allKopdes.find((k) => k.id === filterLocation)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="font-['Quicksand',sans-serif]">
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
                    <SelectTrigger className="w-[140px] border-gray-200 text-xs font-semibold rounded-md">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="font-['Quicksand',sans-serif]">
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider min-w-[200px]">
                          Nama Petani
                        </TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          No. HP
                        </TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Asal Kopdes
                        </TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Status KYC
                        </TableHead>
                        <TableHead className="text-right text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-28 text-center text-sm font-medium text-gray-400">
                            Memuat data petani...
                          </TableCell>
                        </TableRow>
                      ) : filteredFarmers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-28 text-center text-sm font-medium text-gray-400">
                            Tidak ada data petani yang sesuai dengan filter.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFarmers.map((farmer) => (
                          <TableRow
                            key={farmer.id}
                            className="border-b border-gray-100 odd:bg-white even:bg-[#FEFAE0]/10 hover:bg-gray-50/80 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-gray-200">
                                  <AvatarFallback className="bg-[#606C38]/10 text-[#606C38] font-bold text-xs">
                                    {getInitials(farmer.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-gray-900 text-sm">
                                  {farmer.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-mono text-gray-700">
                              {farmer.phoneNumber}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-gray-700">
                              {farmer.kopdes?.name ? (
                                <span className="flex items-center gap-1.5">
                                  <Building className="h-3.5 w-3.5 text-[#606C38]" />
                                  {farmer.kopdes.name}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 font-medium">Belum diatur</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  farmer.isVerified
                                    ? "bg-[#606C38]/10 border-[#606C38]/30 text-[#606C38] font-bold text-xs"
                                    : "bg-[#DDA15E]/15 border-[#BC6C25]/30 text-[#BC6C25] font-bold text-xs"
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
                                    className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold text-xs h-8 rounded-md shadow-none px-3"
                                  >
                                    Verifikasi
                                  </Button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                                    >
                                      <span className="sr-only">Buka menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]"
                                  >
                                    <DropdownMenuItem
                                      onClick={() => handleViewDetails(farmer)}
                                      className="text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                    >
                                      <Eye className="mr-2 h-3.5 w-3.5 text-gray-500" />
                                      Lihat Detail
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleEdit(farmer)}
                                      className="text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                    >
                                      <Edit2 className="mr-2 h-3.5 w-3.5 text-gray-500" />
                                      Edit Data
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => confirmDelete(farmer)}
                                      className="text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                                    >
                                      <Trash2 className="mr-2 h-3.5 w-3.5 text-red-500" />
                                      Hapus Akun
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Admin Platform (Notion Table UI Shell) */}
        <TabsContent value="admin" className="space-y-6 mt-0">
          <div className="flex items-center justify-end gap-4">
            <Button
              className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold shadow-none rounded-md px-4 py-2 text-sm shrink-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Admin
            </Button>
          </div>

          <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Toolbar & Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Cari nama atau email admin..."
                    className="pl-9 border-gray-200 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px] border-gray-200 text-xs font-semibold rounded-md">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="font-['Quicksand',sans-serif]">
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Nama Administrator
                        </TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Email / Kontak
                        </TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Cakupan Wilayah / Kopdes
                        </TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Status Akun
                        </TableHead>
                        <TableHead className="text-right text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="h-28 text-center font-medium text-gray-400 text-sm">
                          Belum ada data administrator platform.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Mitra Perusahaan (Notion Table UI Shell) */}
        <TabsContent value="perusahaan" className="space-y-6 mt-0">
          <div className="flex items-center justify-end gap-4">
            <Button
              className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold shadow-none rounded-md px-4 py-2 text-sm shrink-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Mitra
            </Button>
          </div>

          <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Toolbar & Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Cari nama perusahaan atau email..."
                    className="pl-9 border-gray-200 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px] border-gray-200 text-xs font-semibold rounded-md">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="font-['Quicksand',sans-serif]">
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Nama Perusahaan Off-taker
                        </TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Kontak Perusahaan
                        </TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Sektor Industri
                        </TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Status Kemitraan
                        </TableHead>
                        <TableHead className="text-right text-gray-700 font-bold text-xs uppercase tracking-wider">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="h-28 text-center font-medium text-gray-400 text-sm">
                          Belum ada data mitra perusahaan.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS --- */}
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]">
          <form onSubmit={handleSubmitAdd(handleCreateFarmer)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">Buat Akun Petani Baru</DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500">
                Status verifikasi awal akan mengikuti pengaturan sistem Auto-Verify.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-name" className="text-xs font-bold text-gray-700">
                  Nama Lengkap
                </Label>
                <Input
                  id="add-name"
                  {...registerAdd("name")}
                  placeholder="Nama petani"
                  className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                />
                {errorsAdd.name && (
                  <p className="text-xs text-red-500 font-medium">
                    {errorsAdd.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-phoneNumber" className="text-xs font-bold text-gray-700">
                  Nomor HP / WhatsApp
                </Label>
                <Input
                  id="add-phoneNumber"
                  {...registerAdd("phoneNumber")}
                  placeholder="081234567890"
                  className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                />
                {errorsAdd.phoneNumber && (
                  <p className="text-xs text-red-500 font-medium">
                    {errorsAdd.phoneNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-pin" className="text-xs font-bold text-gray-700">
                  PIN Keamanan (6 Angka)
                </Label>
                <Input
                  id="add-pin"
                  type="password"
                  {...registerAdd("pin")}
                  maxLength={6}
                  placeholder="******"
                  className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                />
                {errorsAdd.pin && (
                  <p className="text-xs text-red-500 font-medium">
                    {errorsAdd.pin.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-kopdes" className="text-xs font-bold text-gray-700">
                  Koperasi Desa (Kopdes)
                </Label>
                <Controller
                  name="kopdesId"
                  control={controlAdd}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="border-gray-300 focus:ring-[#606C38] rounded-md text-sm">
                        <SelectValue placeholder="Pilih Kopdes...">
                          {field.value
                            ? allKopdes.find((k) => k.id === field.value)?.name
                            : "Pilih Kopdes..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="font-['Quicksand',sans-serif]">
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
                  <p className="text-xs text-red-500 font-medium">
                    {errorsAdd.kopdesId.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="border-gray-300 text-gray-700 rounded-md text-sm shadow-none"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingAdd}
                className="bg-[#606C38] hover:bg-[#283618] text-white rounded-md text-sm font-semibold shadow-none"
              >
                {isSubmittingAdd ? "Menyimpan..." : "Simpan Akun"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]">
          <form onSubmit={handleSubmitEdit(handleUpdateFarmer)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">Edit Data Petani</DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500">
                Perbarui detail informasi akun petani yang dipilih.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-bold text-gray-700">
                  Nama Lengkap
                </Label>
                <Input
                  id="edit-name"
                  {...registerEdit("name")}
                  className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                />
                {errorsEdit.name && (
                  <p className="text-xs text-red-500 font-medium">
                    {errorsEdit.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phoneNumber" className="text-xs font-bold text-gray-700">
                  Nomor HP
                </Label>
                <Input
                  id="edit-phoneNumber"
                  {...registerEdit("phoneNumber")}
                  className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                />
                {errorsEdit.phoneNumber && (
                  <p className="text-xs text-red-500 font-medium">
                    {errorsEdit.phoneNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-kopdes" className="text-xs font-bold text-gray-700">
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
                      <SelectTrigger className="border-gray-300 focus:ring-[#606C38] rounded-md text-sm">
                        <SelectValue placeholder="Pilih Kopdes...">
                          {field.value
                            ? allKopdes.find((k) => k.id === field.value)?.name
                            : "Tidak ada"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="font-['Quicksand',sans-serif]">
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
              <div className="flex items-center justify-between border border-gray-100 rounded-md p-3 bg-gray-50/50">
                <Label htmlFor="isVerified" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Status Terverifikasi (KYC)
                </Label>
                <Controller
                  name="isVerified"
                  control={controlEdit}
                  render={({ field }) => (
                    <Switch
                      id="isVerified"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-300 text-gray-700 rounded-md text-sm shadow-none"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingEdit}
                className="bg-[#606C38] hover:bg-[#283618] text-white rounded-md text-sm font-semibold shadow-none"
              >
                {isSubmittingEdit ? "Memperbarui..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Apakah Anda benar-benar yakin?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-gray-600">
              Tindakan ini akan menghapus akun petani secara permanen dari database sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-gray-300 text-gray-700 rounded-md text-sm shadow-none">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold shadow-none"
            >
              Hapus Akun
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Verifikasi & Tetapkan Kopdes
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Pilih Kopdes untuk petani <span className="font-bold text-gray-800">{selectedFarmer?.name}</span> guna mengaktifkan verifikasi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-1.5">
            <Label htmlFor="kopdes-select" className="text-xs font-bold text-gray-700">
              Koperasi Desa Tujuan
            </Label>
            <Select
              onValueChange={setSelectedKopdesId}
              value={selectedKopdesId || ""}
            >
              <SelectTrigger id="kopdes-select" className="border-gray-300 focus:ring-[#606C38] rounded-md text-sm">
                <SelectValue placeholder="Pilih Kopdes...">
                  {selectedKopdesId
                    ? allKopdes.find((k) => k.id === selectedKopdesId)?.name
                    : "Pilih Kopdes..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="font-['Quicksand',sans-serif]">
                {allKopdes.map((kopdes) => (
                  <SelectItem key={kopdes.id} value={kopdes.id}>
                    {kopdes.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsVerifyDialogOpen(false)}
              className="border-gray-300 text-gray-700 rounded-md text-sm shadow-none"
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmVerification}
              className="bg-[#606C38] hover:bg-[#283618] text-white rounded-md text-sm font-semibold shadow-none"
            >
              Konfirmasi Verifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Farmer Detail Side Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-white border-l border-gray-200 shadow-none font-['Quicksand',sans-serif]">
          {selectedFarmer && (
            <>
              <SheetHeader className="border-b border-gray-100 pb-3">
                <SheetTitle className="text-lg font-bold text-gray-900">Detail Petani</SheetTitle>
                <SheetDescription className="text-xs font-medium text-gray-500">
                  Informasi profil lengkap & statistik aktivitas {selectedFarmer.name}.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col items-center p-4 bg-gray-50/50 rounded-md border border-gray-100">
                <Avatar className="h-20 w-20 border-2 border-[#606C38]/20">
                  <AvatarFallback className="bg-[#606C38] text-white text-2xl font-bold">
                    {getInitials(selectedFarmer.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-3 text-xl font-bold text-gray-900">
                  {selectedFarmer.name}
                </h2>
                <p className="text-xs font-mono font-semibold text-gray-600 mt-0.5">
                  {selectedFarmer.phoneNumber}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="border-gray-300 text-gray-700 bg-white font-semibold text-xs">
                    {selectedFarmer.kopdes?.name || "Kopdes belum diatur"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      selectedFarmer.isVerified
                        ? "bg-[#606C38]/10 border-[#606C38]/30 text-[#606C38] font-bold text-xs"
                        : "bg-[#DDA15E]/15 border-[#BC6C25]/30 text-[#BC6C25] font-bold text-xs"
                    }
                  >
                    {selectedFarmer.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Card className="bg-white border border-gray-200 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total Panen
                    </CardTitle>
                    <FileText className="h-4 w-4 text-[#606C38]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-extrabold text-gray-900">
                      {selectedFarmer.harvests || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Eco Points
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-[#BC6C25]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-extrabold text-gray-900">
                      {selectedFarmer.ecoPoints}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}


