import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;
    const body = await request.json();

    const { isVerified } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isVerified },
    });

    return NextResponse.json(
      {
        message: "Status verifikasi berhasil diperbarui",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in PATCH /api/users/[id]/verify:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem" },
      { status: 500 },
    );
  }
}
