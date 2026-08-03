import { z } from "zod";
import { InventoryCategory, InventoryMutationReason } from "@prisma/client";

export const inventoryAdditionSchema = z.object({
  kategori: z.nativeEnum(InventoryCategory),
  jenisProduk: z.string().min(1, "Jenis produk harus diisi"),
  jumlah: z.number().positive("Jumlah harus positif"),
  satuan: z.string().min(1, "Satuan harus diisi"),
  keterangan: z.string().optional(),
});

export const inventoryProcessSchema = z.object({
  bahanBaku: z.string().min(1, "Bahan baku harus diisi"),
  jumlahBahan: z.number().positive("Jumlah harus positif"),
  hasilOlahan: z.string().min(1, "Hasil olahan harus diisi"),
  jumlahHasil: z.number().positive("Jumlah hasil harus positif"),
});

export const inventoryReductionSchema = z.object({
  alasan: z.nativeEnum(InventoryMutationReason),
  komoditas: z.string().min(1, "Komoditas harus diisi"),
  jumlah: z.number().positive("Jumlah harus positif"),
  satuan: z.string().min(1, "Satuan harus diisi"),
});
