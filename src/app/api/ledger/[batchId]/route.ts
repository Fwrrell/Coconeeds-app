import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: { batchId: string } },
) {
  try {
    const { batchId } = await context.params;

    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID tidak ditemukan di database." },
        { status: 400 },
      );
    }

    // tracing data (konsep blockchain)
    // ambil dari ledger -> merge ke batch -> merge ke daftar panen -> merge ke petani
    const ledgerData = await prisma.ledger.findUnique({
      where: {
        batchId: batchId,
      },
      include: {
        batch: {
          include: {
            panens: {
              select: {
                id: true,
                type: true,
                actualWeight: true,
                grade: true,
                petani: {
                  select: { name: true, location: true },
                },
              },
            },
          },
        },
      },
    });

    // kalo qr code palsu atau data batch gaada di db
    if (!ledgerData) {
      return NextResponse.json(
        { error: "Sertifikat tidak valid. Data ledger tidak ditemukan." },
        { status: 404 },
      );
    }

    // return data untuk dirakit jadi certificate HTML
    return NextResponse.json(
      { message: "Sertifikat Traceability valid", data: ledgerData },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/ledger/[batchId]:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
