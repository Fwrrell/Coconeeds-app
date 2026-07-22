import { z } from "zod";

export const kopdesSchema = z.object({
  name: z.string().min(3, { message: "Nama Kopdes harus memiliki minimal 3 karakter." }),
  region: z.string().optional(),
});
