import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      include: {
        // Ambil data dari relasi kopdes
        kopdes: true,
        // Tetap hitung relasi panens jika ada
        _count: {
          select: { panens: true },
        },
      },
    });

    // Format data sesuai dengan apa yang dibutuhkan frontend
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      ecoPoints: user.ecoPoints,
      // Kirim seluruh objek kopdes atau null
      kopdes: user.kopdes ? { id: user.kopdes.id, name: user.kopdes.name } : null,
      harvests: user._count.panens,
    }));

    return NextResponse.json(
      { message: "Data petani berhasil ditampilkan.", data: formattedUsers },
      { status: 200 }, // Status 200 untuk GET, bukan 201
    );
  } catch (err) {
    console.error("Error in GET /api/users:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server" },
      { status: 500 },
    );
  }
}
