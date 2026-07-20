import { z } from "zod";

export const pengirimanSchema = z.object({
  namaKapal: z.string().min(1, "Nama kapal wajib diisi"),
  rute: z.string().min(1, "Rute pengiriman wajib diisi"),
  totalBiaya: z.coerce.number().positive("Total biaya harus bernilai positif"),
  batchIds: z
    .array(z.string().min(1))
    .min(1, "Minimal pilih 1 batch pengiriman"),
});
