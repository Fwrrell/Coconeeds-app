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
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Users,
  Map,
  Building,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { kopdesSchema } from "@/lib/validations/kopdes.schema";

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
    <>
      <div className="flex flex-col gap-6 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Manajemen Kopdes
          </h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Kopdes
          </Button>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmitAdd(handleCreateKopdes)}>
              <DialogHeader>
                <DialogTitle>Buat Kopdes Baru</DialogTitle>
                <DialogDescription>
                  Isi detail di bawah ini untuk mendaftarkan Kopdes baru.
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
                  <Label htmlFor="add-region" className="text-right">
                    Wilayah
                  </Label>
                  <Input
                    id="add-region"
                    {...registerAdd("region")}
                    className="col-span-3"
                    placeholder="Contoh: Jawa Barat"
                  />
                  {errorsAdd.region && (
                    <p className="col-span-4 text-xs text-red-500 text-right">
                      {errorsAdd.region.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmittingAdd}>
                  {isSubmittingAdd ? "Menyimpan..." : "Simpan Kopdes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmitEdit(handleUpdateKopdes)}>
              <DialogHeader>
                <DialogTitle>Edit Data Kopdes</DialogTitle>
                <DialogDescription>
                  Perbarui detail Kopdes di bawah ini.
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
                  <Label htmlFor="edit-region" className="text-right">
                    Wilayah
                  </Label>
                  <Input
                    id="edit-region"
                    {...registerEdit("region")}
                    className="col-span-3"
                  />
                  {errorsEdit.region && (
                    <p className="col-span-4 text-xs text-red-500 text-right">
                      {errorsEdit.region.message}
                    </p>
                  )}
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
                Tindakan ini akan menghapus Kopdes. Ini tidak dapat dilakukan
                jika masih ada petani yang terdaftar di Kopdes ini.
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Kopdes
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalKopdes}</div>
              <p className="text-xs text-muted-foreground">
                Total Kopdes terdaftar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Wilayah
              </CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRegions}</div>
              <p className="text-xs text-muted-foreground">
                Jumlah unik wilayah
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Petani Aktif
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFarmers}</div>
              <p className="text-xs text-muted-foreground">
                Petani terhubung dengan Kopdes
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
                  placeholder="Cari nama Kopdes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kopdes</TableHead>
                    <TableHead>Wilayah</TableHead>
                    <TableHead>Total Petani</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredKopdes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Tidak ada data Kopdes yang cocok.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredKopdes.map((kopdes) => (
                      <TableRow key={kopdes.id}>
                        <TableCell>
                          <span className="font-medium">{kopdes.name}</span>
                        </TableCell>
                        <TableCell>{kopdes.region || "N/A"}</TableCell>
                        <TableCell>{kopdes._count.users}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(kopdes)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => confirmDelete(kopdes)}
                                className="text-red-600"
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
