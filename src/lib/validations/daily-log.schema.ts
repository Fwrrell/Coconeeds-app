import { z } from "zod";
import { WeatherCondition } from "@prisma/client";

export const dailyLogSchema = z.object({
  lahanId: z.string().min(1, "Lahan ID harus ada"),
  tanggal: z.string().min(1, "Tanggal harus ada"),
  isWatered: z.boolean().optional(),
  harvestCountKg: z.number().optional(),
  fruitDropCount: z.number().optional(),
  pestType: z.string().optional(),
  weatherCondition: z.nativeEnum(WeatherCondition),
});
