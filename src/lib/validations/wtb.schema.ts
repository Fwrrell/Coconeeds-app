import { z } from "zod";

export const wtbSchema = z.object({
  perusahaanId: z.string().min(1, "ID Perusahaan wajib diisi"),
  komoditas: z.string().min(1, "Komoditas wajib diisi"),
  targetWeight: z.coerce.number().positive("Target berat harus bernilai positif"),
  maxPrice: z.coerce.number().positive("Harga maksimal harus bernilai positif"),
  destination: z.string().min(1, "Tujuan pengiriman wajib diisi"),
});
