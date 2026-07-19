import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { wtbId: string } },
) {
  try {
    const { wtbId } = params;

    const negosiasi = await prisma.negosiasi.findMany({
      where: { wtbId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      { message: "Data Negosiasi berhasil diambil.", data: negosiasi },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/wtb/[wtbId]:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahpada pada sistem." },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { wtbId: string } },
) {
  try {
    const { wtbId } = params;
    const body = await req.json();
    const { senderRole, offeredPrice, note } = body;

    if (!senderRole || !offeredPrice) {
      return NextResponse.json(
        {
          error: "Data tidak lengkap. Pastikan semua data terisi.",
        },
        { status: 400 },
      );
    }

    const newNego = await prisma.negosiasi.create({
      data: {
        wtbId,
        senderRole,
        offeredPrice: Number(offeredPrice),
        note,
      },
    });

    return NextResponse.json(
      { message: "Harga nego berhasil ditawarkan.", data: newNego },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/wtb/[wtbId]:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
