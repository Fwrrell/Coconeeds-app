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
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  ShieldCheck,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoVerifySwitch } from "@/components/admin/AutoVerifySwitch";
import { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { registerSchema } from "@/lib/validations/register.schema";
import { motion } from "framer-motion";
// inline type biar ga error browser
type ApprovalStatus = any;
import React from "react";

// --- Helper Functions ---
const getInitials = (name?: string | null) => {
  const safeName = name || "N/A";
  const names = safeName.split(" ");
  if (names.length > 1 && names[0] && names[1]) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return safeName.substring(0, 2).toUpperCase();
};

const statusConfig: Record<ApprovalStatus, any> = {
  PENDING: {
    text: "Pending",
    icon: ShieldAlert,
    color: "bg-[#DDA15E]/15 border-[#BC6C25]/30 text-[#BC6C25]",
  },
  APPROVED: {
    text: "Approved",
    icon: ShieldCheck,
    color: "bg-[#606C38]/10 border-[#606C38]/30 text-[#606C38]",
  },
  REJECTED: {
    text: "Rejected",
    icon: UserX,
    color: "bg-red-100 border-red-200 text-red-600",
  },
};

// --- Form Schemas ---
const editFarmerSchema = registerSchema.omit({ pin: true }).extend({
  isVerified: z.boolean().optional(),
});
const addAdminSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }),
});

// --- Type Definitions ---
type Kopdes = { id: string; name: string };
type Farmer = {
  id: string;
  name: string;
  phoneNumber: string;
  isVerified: boolean;
  ecoPoints: number;
  harvests?: number;
  kopdes: Kopdes | null;
};
type Company = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  approvalStatus: ApprovalStatus;
  createdAt: string;
};
type WhitelistedAdmin = {
  id: string;
  email: string;
  createdAt: string;
  addedBy: string | null;
};
type RegisterFormValues = z.infer<typeof registerSchema>;
type EditFormValues = z.infer<typeof editFarmerSchema>;
type AddAdminFormValues = z.infer<typeof addAdminSchema>;

export default function UserManagementPage() {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState("petani");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [admins, setAdmins] = useState<WhitelistedAdmin[]>([]);
  const [allKopdes, setAllKopdes] = useState<Kopdes[]>([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dialog states
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isAddFarmerDialogOpen, setIsAddFarmerDialogOpen] = useState(false);
  const [isEditFarmerDialogOpen, setIsEditFarmerDialogOpen] = useState(false);
  const [isDeleteFarmerDialogOpen, setIsDeleteFarmerDialogOpen] =
    useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isDeleteAdminDialogOpen, setIsDeleteAdminDialogOpen] = useState(false);
  const [isApproveCompanyDialogOpen, setIsApproveCompanyDialogOpen] =
    useState(false);

  // Selected items for actions
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedAdminEmail, setSelectedAdminEmail] = useState<string | null>(
    null,
  );
  const [selectedKopdesId, setSelectedKopdesId] = useState<string | null>(null);

  // --- React Hook Form Initializations ---
  const {
    control: controlAdd,
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
    reset: resetAdd,
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const {
    control: controlEdit,
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<EditFormValues>({ resolver: zodResolver(editFarmerSchema) });
  const {
    register: registerAdmin,
    handleSubmit: handleSubmitAdmin,
    formState: { errors: errorsAdmin, isSubmitting: isSubmittingAdmin },
    reset: resetAdmin,
  } = useForm<AddAdminFormValues>({ resolver: zodResolver(addAdminSchema) });

  useEffect(() => {
    if (selectedFarmer && isEditFarmerDialogOpen) {
      setEditValue("name", selectedFarmer.name);
      setEditValue("phoneNumber", selectedFarmer.phoneNumber);
      setEditValue("isVerified", selectedFarmer.isVerified);
      setEditValue("kopdesId", selectedFarmer.kopdes?.id || "");
    }
  }, [selectedFarmer, isEditFarmerDialogOpen, setEditValue]);

  // --- Data Fetching ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [farmersRes, kopdesRes, companiesRes, adminsRes] =
        await Promise.all([
          fetch("/api/users?role=PETANI"),
          fetch("/api/kopdes"),
          fetch("/api/users?role=PERUSAHAAN"),
          fetch("/api/admin-whitelist"),
        ]);

      const farmersData = await farmersRes.json();
      const kopdesData = await kopdesRes.json();
      const companiesData = await companiesRes.json();
      const adminsData = await adminsRes.json();

      setFarmers(farmersData.data || []);
      setAllKopdes(kopdesData.data || []);
      setCompanies(companiesData.data || []);
      setAdmins(adminsData.data || []);
    } catch (err) {
      toast.error("Gagal memuat data pengguna.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Action Handlers ---
  const handleCreateFarmer: SubmitHandler<any> = async (data) => {
    try {
      const payload = {
        ...data,
        isVerified: !!data.kopdesId,
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok)
        throw new Error(
          (await res.json()).error || "Gagal membuat akun petani.",
        );

      toast.success("Akun petani berhasil dibuat!");
      resetAdd();
      setIsAddFarmerDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
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
      if (!res.ok)
        throw new Error(
          (await res.json()).error || "Gagal memperbarui data petani.",
        );
      toast.success("Data petani berhasil diperbarui!");
      resetEdit();
      setIsEditFarmerDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleConfirmVerification = async () => {
    if (!selectedFarmer || !selectedKopdesId)
      return toast.error("Silakan pilih Kopdes.");
    try {
      const res = await fetch(`/api/users/${selectedFarmer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: true, kopdesId: selectedKopdesId }),
      });
      if (!res.ok)
        throw new Error(
          (await res.json()).error || "Gagal memverifikasi petani.",
        );
      toast.success("Petani berhasil diverifikasi!");
      fetchData();
      setIsVerifyDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteFarmer = async () => {
    if (!selectedFarmer) return;
    try {
      const res = await fetch(`/api/users/${selectedFarmer.id}`, {
        method: "DELETE",
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Gagal menghapus petani.");
      toast.success(`Akun untuk ${selectedFarmer.name} berhasil dihapus.`);
      fetchData();
      setIsDeleteFarmerDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddAdmin: SubmitHandler<AddAdminFormValues> = async (data) => {
    try {
      const res = await fetch("/api/admin-whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(
        `Email ${data.email} berhasil ditambahkan ke whitelist admin.`,
      );
      fetchData();
      resetAdmin();
      setIsAddAdminDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdminEmail) return;
    try {
      const res = await fetch("/api/admin-whitelist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedAdminEmail }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(
        `Email ${selectedAdminEmail} berhasil dihapus dari whitelist.`,
      );
      fetchData();
      setIsDeleteAdminDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleApproval = async (status: ApprovalStatus) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/users/${selectedCompany.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(
        `Status ${selectedCompany.name} berhasil diubah menjadi ${status}.`,
      );
      fetchData();
      setIsApproveCompanyDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // --- Memoized Filters ---
  const filteredFarmers = useMemo(
    () =>
      farmers.filter((farmer) => {
        const matchSearch =
          farmer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.phoneNumber?.includes(searchQuery);
        const matchLocation =
          filterLocation === "all" || farmer.kopdes?.id === filterLocation;
        const matchStatus =
          filterStatus === "all" ||
          (filterStatus === "verified"
            ? farmer.isVerified
            : !farmer.isVerified);
        return matchSearch && matchLocation && matchStatus;
      }),
    [farmers, searchQuery, filterLocation, filterStatus],
  );

  const { totalFarmers, pendingVerification, verifiedFarmers } = useMemo(() => {
    const safeFarmers = Array.isArray(farmers) ? farmers : [];
    return {
      totalFarmers: safeFarmers.length,
      pendingVerification: safeFarmers.filter((f) => !f.isVerified).length,
      verifiedFarmers: safeFarmers.filter((f) => f.isVerified).length,
    };
  }, [farmers]);

  // --- Render Logic ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 bg-white min-h-screen font-['Quicksand',sans-serif]"
    >
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
            Kelola pendaftaran anggota petani, administrator platform, serta
            akun mitra perusahaan.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="border-b border-gray-200 p-0 h-auto bg-transparent rounded-none flex gap-6">
          <TabsTrigger
            value="petani"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#606C38] data-[state=active]:text-[#606C38] rounded-none bg-transparent shadow-none font-bold text-xs uppercase tracking-wider px-1 pb-3 text-gray-500 transition-colors"
          >
            Petani ({totalFarmers})
          </TabsTrigger>
          <TabsTrigger
            value="perusahaan"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#606C38] data-[state=active]:text-[#606C38] rounded-none bg-transparent shadow-none font-bold text-xs uppercase tracking-wider px-1 pb-3 text-gray-500 transition-colors"
          >
            Mitra Perusahaan ({companies.length})
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#606C38] data-[state=active]:text-[#606C38] rounded-none bg-transparent shadow-none font-bold text-xs uppercase tracking-wider px-1 pb-3 text-gray-500 transition-colors"
          >
            Admin Platform ({admins.length})
          </TabsTrigger>
        </TabsList>

        {/* Petani Tab */}
        <TabsContent value="petani" className="space-y-6 mt-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AutoVerifySwitch />
            </div>
            <Button
              onClick={() => setIsAddFarmerDialogOpen(true)}
              className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold shadow-none rounded-md px-4 py-2 text-sm shrink-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Petani
            </Button>
          </div>
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
                <div className="text-2xl font-extrabold text-gray-900">
                  {totalFarmers}
                </div>
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
                <div className="text-2xl font-extrabold text-gray-900">
                  {pendingVerification}
                </div>
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
                <div className="text-2xl font-extrabold text-gray-900">
                  {verifiedFarmers}
                </div>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  Petani aktif terverifikasi KYC
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-4">
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
                          : allKopdes.find((k) => k.id === filterLocation)
                              ?.name}
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
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Nama Petani</TableHead>
                        <TableHead>No. HP</TableHead>
                        <TableHead>Asal Kopdes</TableHead>
                        <TableHead>Status KYC</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-28 text-center">
                            Memuat...
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFarmers.map((farmer) => (
                          <TableRow key={farmer.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border">
                                  <AvatarFallback>
                                    {getInitials(farmer.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{farmer.name}</span>
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
                              >
                                {farmer.isVerified ? "Verified" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {!farmer.isVerified && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedFarmer(farmer);
                                    setIsVerifyDialogOpen(true);
                                  }}
                                >
                                  Verifikasi
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  }
                                />
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFarmer(farmer);
                                      setIsDetailSheetOpen(true);
                                    }}
                                  >
                                    Lihat Detail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFarmer(farmer);
                                      setIsEditFarmerDialogOpen(true);
                                    }}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFarmer(farmer);
                                      setIsDeleteFarmerDialogOpen(true);
                                    }}
                                  >
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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

        {/* Mitra Perusahaan Tab */}
        <TabsContent value="perusahaan" className="space-y-6 mt-0">
          <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                  <TableRow>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Registrasi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Memuat data perusahaan...
                      </TableCell>
                    </TableRow>
                  ) : (
                    companies.map((user) => (
                      <TableRow key={user.id} className="border-b">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              <AvatarImage src={user.image || ""} />
                              <AvatarFallback>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold">{user.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusConfig[user.approvalStatus].color}
                          >
                            {React.createElement(
                              statusConfig[user.approvalStatus].icon,
                              { className: "mr-1.5 h-3.5 w-3.5" },
                            )}
                            {statusConfig[user.approvalStatus].text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString(
                            "id-ID",
                            { dateStyle: "long" },
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.approvalStatus === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCompany(user);
                                setIsApproveCompanyDialogOpen(true);
                              }}
                              className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold rounded-md text-xs h-8 px-3"
                            >
                              Tindakan
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Admin Platform Tab */}
        <TabsContent value="admin" className="space-y-6 mt-0">
          <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
              <div>
                <CardTitle className="text-base font-bold">
                  Admin Whitelist
                </CardTitle>
                <CardDescription className="text-xs">
                  Email di daftar ini akan menjadi ADMIN saat login.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddAdminDialogOpen(true)}
                className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold rounded-md text-sm px-4 py-2"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Admin
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Ditambahkan Oleh</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Memuat...
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin.id} className="border-b">
                        <TableCell className="font-semibold">
                          {admin.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {admin.addedBy || "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(admin.createdAt).toLocaleDateString(
                            "id-ID",
                            { dateStyle: "long" },
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAdminEmail(admin.email);
                              setIsDeleteAdminDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Dialog Tambah Petani */}
      <Dialog
        open={isAddFarmerDialogOpen}
        onOpenChange={setIsAddFarmerDialogOpen}
      >
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Tambah Petani Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Isi data di bawah. Pilih Pos Kopdes agar akun otomatis
              diverifikasi (KYC).
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmitAdd(handleCreateFarmer)}
            className="space-y-4 py-2"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                Nama Lengkap
              </label>
              <Input
                {...registerAdd("name")}
                placeholder="Masukkan nama..."
                className="h-10 text-xs font-semibold"
              />
              {errorsAdd.name && (
                <span className="text-xs text-red-500">
                  {errorsAdd.name.message as string}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                Nomor HP
              </label>
              <Input
                {...registerAdd("phoneNumber")}
                placeholder="Contoh: 08123456789"
                className="h-10 text-xs font-semibold"
              />
              {errorsAdd.phoneNumber && (
                <span className="text-xs text-red-500">
                  {errorsAdd.phoneNumber.message as string}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                PIN (6 Digit)
              </label>
              <Input
                type="password"
                {...registerAdd("pin")}
                placeholder="******"
                className="h-10 text-xs font-semibold"
              />
              {errorsAdd.pin && (
                <span className="text-xs text-red-500">
                  {errorsAdd.pin.message as string}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                Assign ke Pos Kopdes
              </label>
              <Controller
                name="kopdesId"
                control={controlAdd}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full h-10 border-gray-200 text-xs font-semibold rounded-md">
                      <SelectValue placeholder="Pilih Pos Kopdes">
                        {field.value
                          ? allKopdes.find((k) => k.id === field.value)?.name
                          : "Pilih Pos Kopdes"}
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
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddFarmerDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingAdd}
                className="bg-[#606C38] text-white font-bold"
              >
                {isSubmittingAdd ? "Menyimpan..." : "Simpan & Verifikasi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOGS */}
      <Dialog
        open={isAddAdminDialogOpen}
        onOpenChange={setIsAddAdminDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Admin ke Whitelist</DialogTitle>
            <DialogDescription>
              Masukkan email yang ingin dijadikan admin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdmin(handleAddAdmin)}>
            <div className="grid gap-4 py-4">
              <Input
                {...registerAdmin("email")}
                placeholder="admin@example.com"
              />
              {errorsAdmin.email && (
                <p className="text-xs text-red-500">
                  {errorsAdmin.email.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddAdminDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingAdmin}
                className="bg-[#606C38] hover:bg-[#283618] text-white"
              >
                {isSubmittingAdmin ? "Menambahkan..." : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteAdminDialogOpen}
        onOpenChange={setIsDeleteAdminDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Email dari Whitelist?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus{" "}
              <span className="font-bold">{selectedAdminEmail}</span> dari
              daftar admin. Pengguna ini akan kehilangan hak akses admin pada
              login berikutnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={isApproveCompanyDialogOpen}
        onOpenChange={setIsApproveCompanyDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Persetujuan Akun</AlertDialogTitle>
            <AlertDialogDescription>
              Pilih status persetujuan untuk pengguna{" "}
              <span className="font-bold">{selectedCompany?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => handleApproval("REJECTED")}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Tolak
            </Button>
            <AlertDialogAction
              onClick={() => handleApproval("APPROVED")}
              className="bg-[#606C38] hover:bg-[#283618]"
            >
              Setujui
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Detail Sheet Petani */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="bg-white border-l border-gray-200 font-['Quicksand',sans-serif]">
          <SheetHeader>
            <SheetTitle className="text-[#606C38] font-bold">
              Detail Petani
            </SheetTitle>
            <SheetDescription className="text-xs text-gray-500">
              Informasi lengkap profil petani.
            </SheetDescription>
          </SheetHeader>
          {selectedFarmer && (
            <div className="space-y-4 py-4 text-xs">
              <div>
                <span className="font-bold text-gray-500 block">
                  Nama Lengkap
                </span>
                <p className="font-semibold text-gray-900 text-sm">
                  {selectedFarmer.name}
                </p>
              </div>
              <div>
                <span className="font-bold text-gray-500 block">
                  Nomor Telepon
                </span>
                <p className="font-semibold text-gray-900">
                  {selectedFarmer.phoneNumber || "-"}
                </p>
              </div>
              <div>
                <span className="font-bold text-gray-500 block">
                  Pos Kopdes
                </span>
                <p className="font-semibold text-gray-900">
                  {selectedFarmer.kopdes?.name || "Belum Terhubung"}
                </p>
              </div>
              <div>
                <span className="font-bold text-gray-500 block">
                  Status Verifikasi
                </span>
                <Badge
                  className={
                    selectedFarmer.isVerified
                      ? "bg-[#606C38] text-white"
                      : "bg-amber-100 text-amber-800"
                  }
                >
                  {selectedFarmer.isVerified ? "Tervalidasi" : "Pending"}
                </Badge>
              </div>
              <div>
                <span className="font-bold text-gray-500 block">
                  Eco-Points
                </span>
                <p className="font-bold text-[#606C38]">
                  {selectedFarmer.ecoPoints || 0} Pts
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Dialog Petani */}
      <Dialog
        open={isEditFarmerDialogOpen}
        onOpenChange={setIsEditFarmerDialogOpen}
      >
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Edit Data Petani
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmitEdit(handleUpdateFarmer)}
            className="space-y-4 py-2"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Nama</label>
              <Input
                {...registerEdit("name")}
                className="h-10 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                Nomor HP
              </label>
              <Input
                {...registerEdit("phoneNumber")}
                className="h-10 text-xs font-semibold"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditFarmerDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingEdit}
                className="bg-[#606C38] text-white font-bold"
              >
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog Petani */}
      <AlertDialog
        open={isDeleteFarmerDialogOpen}
        onOpenChange={setIsDeleteFarmerDialogOpen}
      >
        <AlertDialogContent className="bg-white border border-gray-200 rounded-2xl font-['Quicksand',sans-serif]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Hapus Data Petani
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500">
              Apakah Anda yakin ingin menghapus petani {selectedFarmer?.name}?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsDeleteFarmerDialogOpen(false)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFarmer}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Verifikasi Petani
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-medium">
              Pilih pos Kopdes untuk menugaskan petani ini (
              {selectedFarmer?.name}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* pilih kopdes dlu sblm approve */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Pilih Pos Kopdes
              </label>
              <Select
                value={selectedKopdesId}
                onValueChange={(val) => val && setSelectedKopdesId(val)}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-gray-300 text-xs font-semibold">
                  <SelectValue placeholder="Pilih Pos Kopdes">
                    {selectedKopdesId
                      ? allKopdes.find((k: any) => k.id === selectedKopdesId)
                          ?.name
                      : "Pilih Pos Kopdes"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="font-['Quicksand',sans-serif]">
                  {allKopdes.map((k: any) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsVerifyDialogOpen(false)}
              className="h-10 text-xs font-bold rounded-xl border-gray-200"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmVerification}
              className="h-10 text-xs font-bold bg-[#606C38] hover:bg-[#283618] text-white rounded-xl shadow-none"
            >
              Verifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
