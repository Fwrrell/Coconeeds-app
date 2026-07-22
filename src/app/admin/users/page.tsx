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
import { AutoVerifySwitch } from "@/components/admin/AutoVerifySwitch";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const getInitials = (name: string) => {
  const safeName = name || "Unknown";
  const names = safeName.split(" ");
  if (names.length > 1 && names[0] && names[1]) {
    return `${names[0][0]}${names[1][0]}`;
  }
  return safeName.substring(0, 2);
};

type Farmer = {
  id: string;
  name: string;
  phoneNumber: string;
  location: string;
  isVerified: boolean;
  ecoPoints: number;
  harvests?: number;
};

export default function PetaniManagementPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);

  const fetchFarmers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users?role=PETANI");
      const responseData = await res.json();

      console.log("Response dari API /users:", responseData);

      if (Array.isArray(responseData)) {
        setFarmers(responseData);
      } else if (responseData && Array.isArray(responseData.data)) {
        setFarmers(responseData.data);
      } else {
        console.warn("Format data tidak dikenali:", responseData);
        setFarmers([]);
      }
    } catch (err) {
      console.error("Gagal menarik data", err);
      toast.error("Gagal memuat data petani.");
      setFarmers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleVerify = async (farmerId: string) => {
    try {
      const res = await fetch(`/api/users/${farmerId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: true }),
      });
      if (res.ok) {
        toast.success("Petani berhasil diverifikasi!");
        fetchFarmers();
      } else {
        toast.error("Gagal memverifikasi petani");
      }
    } catch (error) {
      toast.error("Gagal memverifikasi petani");
    }
  };

  const handleViewDetails = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsSheetOpen(true);
  };

  const handleEdit = (farmer: Farmer) => {
    toast.info(`Edit petani: ${farmer.name}`);
  };

  const handleDelete = (farmer: Farmer) => {
    toast.error(`Hapus petani: ${farmer.name}`);
  };

  const safeFarmers = Array.isArray(farmers) ? farmers : [];
  const filteredFarmers = safeFarmers.filter((farmer) => {
    const matchSearch =
      farmer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.phoneNumber?.includes(searchQuery);
    const matchLocation =
      filterLocation === "all" || farmer.location === filterLocation;
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
      <div className="flex flex-col gap-6 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Manajemen Petani
          </h1>
          <div className="flex items-center gap-4">
            <AutoVerifySwitch />
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Petani
            </Button>
          </div>
        </div>

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
                  <SelectValue placeholder="Lokasi / Kopdes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Lokasi</SelectItem>
                  <SelectItem value="Kopdes Merah Putih Aru">
                    Kopdes Merah Putih Aru
                  </SelectItem>
                  <SelectItem value="Kopdes Tunas Harapan">
                    Kopdes Tunas Harapan
                  </SelectItem>
                  <SelectItem value="Kopdes Jaya Bersama">
                    Kopdes Jaya Bersama
                  </SelectItem>
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
                        <TableCell>{farmer.location}</TableCell>
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
                                onClick={() => handleVerify(farmer.id)}
                              >
                                Verifikasi
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Buka menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
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
                                  onClick={() => handleDelete(farmer)}
                                  className="text-red-600"
                                >
                                  Hapus
                                </DropdownMenuItem>{" "}
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                  {selectedFarmer.location}
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
