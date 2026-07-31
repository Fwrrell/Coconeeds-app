"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Users,
  Map,
  Building,
  Edit2,
  Trash2,
  Building2,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { kopdesSchema } from "@/lib/validations/kopdes.schema";
import { motion } from "framer-motion";

type Kopdes = {
  id: string;
  name: string;
  region: string | null;
  _count: {
    users: number;
  };
};

type KopdesFormValues = z.infer<typeof kopdesSchema>;

export default function KopdesManagementPage() {
  const [allKopdes, setAllKopdes] = useState<Kopdes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedKopdes, setSelectedKopdes] = useState<Kopdes | null>(null);

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
    reset: resetAdd,
  } = useForm<KopdesFormValues>({
    resolver: zodResolver(kopdesSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<KopdesFormValues>({
    resolver: zodResolver(kopdesSchema),
  });

  useEffect(() => {
    if (selectedKopdes && isEditDialogOpen) {
      setEditValue("name", selectedKopdes.name);
      setEditValue("region", selectedKopdes.region || "");
    }
  }, [selectedKopdes, isEditDialogOpen, setEditValue]);

  const fetchKopdes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/kopdes");
      const responseData = await res.json();
      const kopdesArray = Array.isArray(responseData.data)
        ? responseData.data
        : [];
      setAllKopdes(kopdesArray);
    } catch (err) {
      console.error("Gagal menarik data Kopdes:", err);
      toast.error("Gagal memuat data Kopdes.");
      setAllKopdes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKopdes();
  }, []);

  const handleCreateKopdes: SubmitHandler<KopdesFormValues> = async (data) => {
    try {
      const res = await fetch("/api/kopdes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal membuat Kopdes.");
      }
      toast.success("Kopdes berhasil dibuat!");
      resetAdd();
      setIsAddDialogOpen(false);
      fetchKopdes();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleUpdateKopdes: SubmitHandler<KopdesFormValues> = async (data) => {
    if (!selectedKopdes) return;
    try {
      const res = await fetch(`/api/kopdes/${selectedKopdes.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memperbarui Kopdes.");
      }
      toast.success("Data Kopdes berhasil diperbarui!");
      resetEdit();
      setIsEditDialogOpen(false);
      fetchKopdes();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const confirmDelete = (kopdes: Kopdes) => {
    setSelectedKopdes(kopdes);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedKopdes) return;
    try {
      const res = await fetch(`/api/kopdes/${selectedKopdes.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menghapus Kopdes.");
      }
      toast.success(`Kopdes ${selectedKopdes.name} berhasil dihapus.`);
      fetchKopdes();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleEdit = (kopdes: Kopdes) => {
    setSelectedKopdes(kopdes);
    setIsEditDialogOpen(true);
  };

  const filteredKopdes = useMemo(() => {
    return allKopdes.filter((kopdes) =>
      kopdes.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allKopdes, searchQuery]);

  const totalKopdes = allKopdes.length;
  const totalRegions = useMemo(
    () => new Set(allKopdes.map((k) => k.region).filter(Boolean)).size,
    [allKopdes],
  );
  const totalFarmers = useMemo(
    () => allKopdes.reduce((sum, k) => sum + k._count.users, 0),
    [allKopdes],
  );

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
              <Building2 className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Kopdes
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Kelola data Koperasi Desa, lokasi wilayah operasional, serta agregasi keanggotaan petani.
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold shadow-none rounded-md px-4 py-2 text-sm shrink-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Kopdes
        </Button>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]">
          <form onSubmit={handleSubmitAdd(handleCreateKopdes)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">Buat Kopdes Baru</DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500">
                Isi detail di bawah ini untuk mendaftarkan unit Kopdes baru.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-name" className="text-xs font-bold text-gray-700">
                  Nama Kopdes
                </Label>
                <Input
                  id="add-name"
                  {...registerAdd("name")}
                  placeholder="Contoh: Kopdes Sukatani"
                  className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                />
                {errorsAdd.name && (
                  <p className="text-xs text-red-500 font-medium">
                    {errorsAdd.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-region" className="text-xs font-bold text-gray-700">
                  Wilayah / Provinsi
                </Label>
                <Input
                  id="add-region"
                  {...registerAdd("region")}
                  placeholder="Contoh: Jawa Barat"
                  className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                />
                {errorsAdd.region && (
                  <p className="text-xs text-red-500 font-medium">
                    {errorsAdd.region.message}
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
                {isSubmittingAdd ? "Menyimpan..." : "Simpan Kopdes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]">
          <form onSubmit={handleSubmitEdit(handleUpdateKopdes)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">Edit Data Kopdes</DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500">
                Perbarui detail informasi unit Kopdes yang dipilih.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-bold text-gray-700">
                  Nama Kopdes
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
                <Label htmlFor="edit-region" className="text-xs font-bold text-gray-700">
                  Wilayah / Provinsi
                </Label>
                <Input
                  id="edit-region"
                  {...registerEdit("region")}
                  className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                />
                {errorsEdit.region && (
                  <p className="text-xs text-red-500 font-medium">
                    {errorsEdit.region.message}
                  </p>
                )}
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
              Tindakan ini akan menghapus data Kopdes. Penghapusan tidak dapat dilakukan jika masih ada anggota petani yang terdaftar di unit ini.
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
              Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Metric Cards Bento Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-white border border-gray-200 rounded-md shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Kopdes
            </CardTitle>
            <span className="p-1.5 rounded-md bg-[#606C38]/10 text-[#606C38]">
              <Building className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900">{totalKopdes}</div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Unit Kopdes terdaftar secara aktif
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-md shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Cakupan Wilayah
            </CardTitle>
            <span className="p-1.5 rounded-md bg-[#DDA15E]/15 text-[#BC6C25]">
              <Map className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900">{totalRegions}</div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Sebaran wilayah & daerah operasional
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-md shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Anggota Petani
            </CardTitle>
            <span className="p-1.5 rounded-md bg-[#283618]/10 text-[#283618]">
              <Users className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900">{totalFarmers}</div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Petani terhubung dalam ekosistem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Search Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Cari nama Kopdes..."
                className="pl-9 border-gray-200 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 shrink-0">
              Menampilkan {filteredKopdes.length} dari {allKopdes.length} Kopdes
            </span>
          </div>

          {/* Table Container */}
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Nama Kopdes
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Wilayah / Lokasi
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Anggota Petani
                    </TableHead>
                    <TableHead className="text-right text-gray-700 font-bold text-xs uppercase tracking-wider">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-28 text-center text-sm font-medium text-gray-400">
                        Memuat data Kopdes...
                      </TableCell>
                    </TableRow>
                  ) : filteredKopdes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-28 text-center text-sm font-medium text-gray-400">
                        Tidak ada data Kopdes yang sesuai dengan pencarian.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredKopdes.map((kopdes) => (
                      <TableRow
                        key={kopdes.id}
                        className="border-b border-gray-100 odd:bg-white even:bg-[#FEFAE0]/10 hover:bg-gray-50/80 transition-colors"
                      >
                        <TableCell>
                          <span className="font-bold text-gray-900 text-sm">
                            {kopdes.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          {kopdes.region ? (
                            <Badge
                              variant="outline"
                              className="border-gray-200 text-gray-700 font-semibold text-xs bg-gray-50"
                            >
                              {kopdes.region}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-gray-800">
                            {kopdes._count.users} Orang
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                                />
                              }
                            >
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]"
                            >
                              <DropdownMenuItem
                                onClick={() => handleEdit(kopdes)}
                                className="text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <Edit2 className="mr-2 h-3.5 w-3.5 text-gray-500" />
                                Edit Data
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => confirmDelete(kopdes)}
                                className="text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5 text-red-500" />
                                Hapus Kopdes
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
    </motion.div>
  );
}

