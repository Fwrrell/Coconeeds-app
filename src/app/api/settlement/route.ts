import { NextResponse } from "next/server";
import { PanenStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { batchId: string } },
) {
  try {
    const { batchId } = params;

    if (!batchId) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Pastikan semua data terisi." },
        { status: 400 },
      );
    }

    // execute transaction untuk memastikan semua status berubah semua
    const result = await prisma.$transaction(async (tx) => {
      // update status batch jadi delivered
      const updatedBatch = await tx.batch.update({
        where: { id: batchId },
        data: {
          status: PanenStatus.DELIVERED,
          updateAt: new Date(),
        },
      });

      // ubah juga semua status panen yang ada di dalam batch menjadi delivered
      await tx.panen.updateMany({
        where: { batchId: batchId },
        data: { status: PanenStatus.DELIVERED },
      });

      return updatedBatch;
    });

    return NextResponse.json(
      { message: "Settlement berhasil, barang telah diterima.", data: result },
      { status: 201 },
    );
  } catch (err) {
    console.error("Settlement POST /api/settlement:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
