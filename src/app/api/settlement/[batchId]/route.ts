import { NextResponse } from "next/server";
import { PanenStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  try {
    // auth check
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    // role check: only ADMIN or PERUSAHAAN can settle
    if (session.user.role !== "ADMIN" && session.user.role !== "PERUSAHAAN") {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk melakukan ini." },
        { status: 403 },
      );
    }

    const { batchId } = await params;


    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID wajib disertakan." },
        { status: 400 },
      );
    }

    // Authorization check: PERUSAHAAN can only settle their own batch
    if (session.user.role === "PERUSAHAAN") {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
        include: { wtbListing: true },
      });

      if (!batch) {
        return NextResponse.json({ error: "Batch tidak ditemukan." }, { status: 404 });
      }

      if (!batch.wtbListing || batch.wtbListing.perusahaanId !== session.user.id) {
        return NextResponse.json(
          { error: "Anda tidak memiliki izin untuk melakukan settlement pada batch ini." },
          { status: 403 },
        );
      }
    }


    // execute transaction untuk memastikan semua status berubah semua
    const result = await prisma.$transaction(async (tx) => {
      // update status batch jadi delivered
      const updatedBatch = await tx.batch.update({
        where: { id: batchId },
        data: {
          status: PanenStatus.DELIVERED,
          updatedAt: new Date(),
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
