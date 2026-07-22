import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  try {
    const body = await req.json();
    const { autoVerifyNewUser } = body;

    if (typeof autoVerifyNewUser !== "boolean") {
      return NextResponse.json(
        { error: "Nilai autoVerifyNewUser harus boolean." },
        { status: 400 }
      );
    }

    const updatedSetting = await prisma.systemSetting.update({
      where: { id: "global_config" },
      data: { autoVerifyNewUser },
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
