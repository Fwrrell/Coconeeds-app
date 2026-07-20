import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phoneNumber: z
    .string()
    .min(10, "Nomor HP minimal 10 digit")
    .max(15, "Nomor HP maksimal 15 digit")
    .regex(/^(\+62|62|0)8[1-9][0-9]{7,12}$/, "Format nomor HP tidak valid"),
  pin: z.string().length(6, "PIN harus terdiri dari 6 digit angka"),
});
