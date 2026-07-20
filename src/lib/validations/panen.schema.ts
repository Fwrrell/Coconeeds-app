import { PengirimanMethod } from "@prisma/client";
import { z } from "zod";

export const panenSchema = z.object({
  petaniId: z.string().min(1, "ID Petani wajib diisi"),
  type: z.string().min(1, "Tipe hasil panen wajib diisi"), // KOPRA | SABUT | TEMPURUNG
  expectedWeight: z
    .coerce
    .number()
    .positive("Estimasi berat harus lebih besar dari 0"),
  tanggalPanen: z.coerce.date({ message: "Tanggal panen tidak valid" }),
  pengirimanMethod: z.nativeEnum(PengirimanMethod, {
    errorMap: () => ({ message: "Metode pengiriman tidak valid" }),
  }),
});
