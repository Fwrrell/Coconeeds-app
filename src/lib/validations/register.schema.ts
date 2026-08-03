import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Nama harus memiliki minimal 3 karakter."),
  // validasi no hp indo dlu hrus 08 depannya
  phoneNumber: z
    .string()
    .min(10, "Nomor HP minimal 10 digit.")
    .max(13, "Nomor HP maksimal 13 digit.")
    .regex(/^08\d{8,11}$/, "Nomor HP harus diawali '08' dan berisi 10-13 digit angka."),
  pin: z
    .string()
    .length(6, "PIN harus 6 digit.")
    .regex(/^\d+$/, "PIN hanya boleh berisi angka."),
  kopdesId: z.string().optional().nullable(),
});
