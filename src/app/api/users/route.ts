import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { checkAdminAccess } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const isAllowed = await checkAdminAccess();
  if (!isAllowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

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
      include: {
        kopdes: role === Role.PETANI ? true : undefined,
        _count: {
          select: { panens: role === Role.PETANI ? true : false },
        },
      },
    });

    let formattedUsers;

    if (role === Role.PERUSAHAAN) {
      formattedUsers = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        approvalStatus: user.approvalStatus,
        createdAt: user.createdAt,
      }));
    } else {
      // Default to PETANI format
      formattedUsers = users.map((user) => ({
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        ecoPoints: user.ecoPoints,
        kopdes: user.kopdes ? { id: user.kopdes.id, name: user.kopdes.name } : null,
        harvests: user._count.panens,
      }));
    }

    return NextResponse.json(
      { message: "Data pengguna berhasil ditampilkan.", data: formattedUsers },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/users:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server" },
      { status: 500 },
    );
  }
}
