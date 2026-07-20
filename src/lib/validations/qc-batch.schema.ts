import { z } from "zod";

const panenItemSchema = z.object({
  panenId: z.string().min(1, "ID Panen wajib disertakan"),
  actualWeight: z.coerce.number().positive("Berat aktual harus bernilai positif"),
  grade: z.string().min(1, "Grade wajib diisi"),
  moisture: z.coerce.number().nonnegative("Kadar air tidak boleh negatif"),
  basePricePerKg: z.coerce.number().positive("Harga dasar harus bernilai positif"),
});

export const qcBatchSchema = z.object({
  type: z.string().min(1, "Tipe batch wajib diisi"),
  panenList: z.array(panenItemSchema).min(1, "Daftar hasil panen tidak boleh kosong"),
});
