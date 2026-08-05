import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ambil data tracking batch kargo b2b perusahaan dgn relasi ledger
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const wtbIdParam = searchParams.get("wtbId");

    const whereClause: any = {};

    if (session.user.role === "PERUSAHAAN") {
      whereClause.wtbListing = {
        perusahaanId: session.user.id,
      };
    }

    if (wtbIdParam) {
      whereClause.wtbListingId = wtbIdParam;
    }

    const batches = await prisma.batch.findMany({
      where: whereClause,
      include: {
        wtbListing: {
          select: { id: true, komoditas: true, targetWeight: true, dealPrice: true, destination: true },
        },
        kopdes: {
          select: { id: true, name: true, region: true },
        },
        pengirimanKapal: true,
        panens: {
          select: { id: true, type: true, actualWeight: true, grade: true, updatedAt: true },
        },
        ledger: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      message: "Data tracking logistik kargo berhasil diambil.",
      data: batches,
    });
  } catch (err) {
    console.error("Error in GET /api/perusahaan/tracking:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
