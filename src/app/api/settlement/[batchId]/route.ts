import { NextResponse } from "next/server";
import { PanenStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// release pembayaran b2b & update status batch ke DELIVERED
export async function POST(
  req: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

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

    if (session.user.role === "PERUSAHAAN") {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
        include: { wtbListing: true },
      });

      if (!batch) {
        return NextResponse.json(
          { error: "Batch tidak ditemukan." },
          { status: 404 },
        );
      }

      if (
        !batch.wtbListing ||
        batch.wtbListing.perusahaanId !== session.user.id
      ) {
        return NextResponse.json(
          {
            error:
              "Anda tidak memiliki izin untuk melakukan settlement pada batch ini.",
          },
          { status: 403 },
        );
      }
    }

    // execute transaction untuk memastikan semua status berubah menjadi DELIVERED
    const result = await prisma.$transaction(async (tx) => {
      const updatedBatch = await tx.batch.update({
        where: { id: batchId },
        data: {
          status: PanenStatus.DELIVERED,
          updatedAt: new Date(),
        },
      });

      await tx.panen.updateMany({
        where: { batchId: batchId },
        data: { status: PanenStatus.DELIVERED },
      });

      return updatedBatch;
    });

    return NextResponse.json(
      {
        message:
          "Settlement pembayaran berhasil, barang telah diterima & pembayaran dirilis ke Kopdes.",
        data: result,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Settlement POST /api/settlement:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
