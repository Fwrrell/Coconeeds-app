import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const whereClause: any = {};
    if (role) {
      whereClause.role = role;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        location: true,
        isVerified: true,
        ecoPoints: true,
        _count: {
          select: { panens: true },
        },
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      location: user.location,
      isVerified: user.isVerified,
      ecoPoints: user.ecoPoints,
      harvests: user._count.panens,
    }));

    return NextResponse.json(
      { message: "Data petani berhasil ditampilkan.", data: formattedUsers },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in GET /api/users:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server" },
      { status: 500 },
    );
  }
}
