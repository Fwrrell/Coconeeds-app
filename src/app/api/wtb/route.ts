import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { perusahaanId, komoditas, targetWeight, maxPrice, destination } =
      body;

    // validate
    if (!perusahaanId || !komoditas || !targetWeight) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Pastikan semua data terisi." },
        { status: 400 },
      );
    }

    const newWtb = await prisma.wtbListing.create({
      data: {
        perusahaanId,
        komoditas,
        targetWeight: Number(targetWeight),
        maxPrice: Number(maxPrice),
        destination,
      },
    });

    return NextResponse.json(
      { message: "Data WTB berhasil dibuat.", data: newWtb },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/wtb:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // ambil semua list WTB yang masih OPEN
    const wtbList = await prisma.wtbListing.findMany({
      where: { status: "OPEN" },
      include: {
        perusahaan: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { message: "Data WTB berhasil diambil.", data: wtbList },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in GET /api/wtb:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
