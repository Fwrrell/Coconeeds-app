import { z } from "zod";

export const negosiasiSchema = z.object({
  offeredPrice: z
    .coerce
    .number()
    .positive("Harga penawaran harus bernilai positif"),
  note: z.string().optional().nullable(),
});
