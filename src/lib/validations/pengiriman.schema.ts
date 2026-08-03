import { z } from "zod";
import { PengirimanMethod } from "@prisma/client";

export const pengirimanSchema = z.object({
  namaKapal: z.string().min(1, "Nama kapal wajib diisi"),
  rute: z.string().min(1, "Rute pengiriman wajib diisi"),
  totalBiaya: z.coerce.number().positive("Total biaya harus bernilai positif"),
  batchIds: z
    .array(z.string().min(1))
    .min(1, "Minimal pilih 1 batch pengiriman"),
});

export const shipmentRequestSchema = z.object({
  kopdesId: z.string().min(1, "Kopdes harus dipilih"),
  komoditasType: z.string().min(1, "Komoditas harus dipilih"),
  beratKg: z.number().positive("Berat harus positif"),
  hargaDasar: z.number().positive("Harga dasar harus positif"),
  catatanPickup: z.string().optional(),
  pengirimanMethod: z.nativeEnum(PengirimanMethod),
  tanggalPanen: z.string().min(1, "Tanggal harus diisi"),
});

export const handoverValidationSchema = z.object({
  pin: z.string().length(6, "PIN harus 6 digit"),
});
