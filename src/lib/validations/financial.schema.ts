import { z } from "zod";
import { FarmerFinancialTxType } from "@prisma/client";

export const financialTxSchema = z.object({
  tipe: z.nativeEnum(FarmerFinancialTxType),
  keterangan: z.string().min(3, "Keterangan minimal 3 karakter"),
  nominalIdr: z.number().positive("Nominal harus positif"),
  kategori: z.string().optional(),
});
