import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

// cache 60s db querynya biar ngurangin latency tiap pindah page
export const getSystemSettings = unstable_cache(
  async () => {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { id: "global_config" },
      });
      return setting;
    } catch (err) {
      console.error("Error in getSystemSettings:", err);
      return null;
    }
  },
  ["global_system_settings"],
  {
    revalidate: 60,
    tags: ["system_settings"],
  }
);
