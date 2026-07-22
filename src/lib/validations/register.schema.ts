import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Nama harus memiliki minimal 3 karakter."),
  phoneNumber: z
    .string()
    .min(10, "Nomor HP minimal 10 digit")
    .max(15, "Nomor HP maksimal 15 digit")
    .regex(/^(\+62|62|0)8[1-9][0-9]{7,12}$/, "Format nomor HP Indonesia tidak valid."),
  pin: z
    .string()
    .length(6, "PIN harus 6 digit.")
    .regex(/^\d+$/, "PIN hanya boleh berisi angka."),
  // Ganti location dengan kopdesId, dan pastikan itu UUID jika ada
  kopdesId: z.string().uuid("ID Kopdes tidak valid.").optional(),
});
