import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/settings
// Mengambil atau membuat pengaturan global
export async function GET() {
  try {
    const setting = await prisma.systemSetting.upsert({
      where: { id: "global_config" },
      update: {},
      create: {
        id: "global_config",
        autoVerifyNewUser: false,
        juriAccess: false,
      },
    });
    return NextResponse.json({ data: setting });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan sistem." },
      { status: 500 }
    );
  }
}

// PATCH /api/settings
// Memperbarui pengaturan global
export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { autoVerifyNewUser, juriAccess } = body;

    const dataToUpdate: { autoVerifyNewUser?: boolean; juriAccess?: boolean } = {};

    if (typeof autoVerifyNewUser === "boolean") {
      dataToUpdate.autoVerifyNewUser = autoVerifyNewUser;
    }
    if (typeof juriAccess === "boolean") {
      dataToUpdate.juriAccess = juriAccess;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "No valid settings provided to update." },
        { status: 400 }
      );
    }

    const updatedSetting = await prisma.systemSetting.update({
      where: { id: "global_config" },
      data: dataToUpdate,
    });

    return NextResponse.json({
      data: updatedSetting,
      message: "Pengaturan berhasil diperbarui.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui pengaturan." },
      { status: 500 }
    );
  }
}
