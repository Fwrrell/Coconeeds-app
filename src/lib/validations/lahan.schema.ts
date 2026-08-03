import { z } from "zod";

export const lahanSchema = z.object({
  namaLahan: z.string().min(3, "Nama lahan minimal 3 karakter"),
  luasM2: z.number().positive("Luas lahan harus positif"),
  jumlahPohon: z.number().int().positive("Jumlah pohon harus positif"),
  lokasiAddress: z.string().min(5, "Lokasi minimal 5 karakter"),
  // optional fields
  tanggalTanam: z.string().optional(),
  pupuk: z.string().optional(),
  deskripsi: z.string().optional(),
});

export const updateLahanSchema = lahanSchema.partial();
