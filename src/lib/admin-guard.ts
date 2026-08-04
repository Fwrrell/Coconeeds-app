import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// panggil guard admin dlu sblm izinin akses api
export async function checkAdminAccess(): Promise<boolean> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return false;
    }

    const role = session.user.role;
    const approvalStatus = session.user.approvalStatus;

    // Admin terverifikasi dpt akses langsung
    if (role === "ADMIN" && approvalStatus === "APPROVED") {
      return true;
    }

    // Cek juriAccess dr system settings
    const settings = await prisma.systemSetting.findUnique({
      where: { id: "global_config" },
    });

    if (settings?.juriAccess) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("Error in checkAdminAccess guard:", err);
    return false;
  }
}
