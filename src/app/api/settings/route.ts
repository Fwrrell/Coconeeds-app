import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.systemSetting.upsert({
      where: { id: "global_config" },
      update: {},
      create: {
        id: "global_config",
        autoVerifyPetani: true,
      },
    });

    return NextResponse.json(
      { message: "Pengaturan berhasil ditampilkan.", data: setting },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in GET /api/settings:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { autoVerifyPetani } = body;

    const updatedSetting = await prisma.systemSetting.update({
      where: { id: "global_config" },
      data: { autoVerifyPetani },
    });

    return NextResponse.json(
      {
        message: "Pengaturan berhasil diperbarui.",
        setting: updatedSetting,
      },
      {
        status: 201,
      },
    );
  } catch (err) {
    console.error("Error in PATCH /api/settings:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem" },
      { status: 500 },
    );
  }
}
