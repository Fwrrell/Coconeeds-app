import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  try {
    const { batchId } = await params;

    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID tidak ditemukan di URL." },
        { status: 400 },
      );
    }

    const ledgerData = await prisma.ledger.findUnique({
      where: {
        batchId: batchId,
      },
      include: {
        batch: {
          include: {
            kopdes: { select: { name: true } }, // ambil nama desa asal
            pengirimanKapal: true, // ambil data pengiriman laut
            panens: {
              select: {
                id: true,
                actualWeight: true,
                grade: true,
                petaniId: true, // ambil ID petani untuk dihitung jumlah partisipannya
              },
            },
          },
        },
      },
    });

    if (!ledgerData) {
      return NextResponse.json(
        { error: "Sertifikat tidak valid. Data ledger tidak ditemukan." },
        { status: 404 },
      );
    }

    const batch = ledgerData.batch;

    const uniqueFarmersCount = new Set(batch.panens.map((p) => p.petaniId))
      .size;

    const batchGrade = batch.panens.length > 0 ? batch.panens[0].grade : "N/A";

    const timeline = [
      {
        step: "Panen & Quality Control",
        location: batch.kopdes?.name || "Gudang Kopdes",
        date: batch.createdAt,
        status: "COMPLETED",
      },
    ];

    if (batch.pengirimanKapal) {
      timeline.push({
        step: "Pengiriman Kargo Laut",
        location: `${batch.pengirimanKapal.namaKapal} (${batch.pengirimanKapal.rute})`,
        date: batch.pengirimanKapal.createdAt,
        status:
          batch.pengirimanKapal.status === "ARRIVED"
            ? "COMPLETED"
            : "IN_PROGRESS",
      });
    }

    if (batch.status === "DELIVERED") {
      timeline.push({
        step: "Tiba di Fasilitas Pembeli",
        location: "Gudang Perusahaan (Selesai)",
        date: batch.updatedAt,
        status: "COMPLETED",
      });
    }

    const certificateData = {
      batchId: batch.id,
      commodity: batch.type,
      totalWeight: batch.totalWeight,
      grade: batchGrade,
      status: batch.status,
      origin: batch.kopdes?.name || "Kopdes",
      farmerCount: uniqueFarmersCount,
      timeline: timeline,
      ledger: {
        prevHash: ledgerData.prevHash,
        currentHash: ledgerData.currentHash,
        verifiedAt: ledgerData.createdAt,
      },
    };

    return NextResponse.json(
      { message: "Sertifikat Traceability valid", data: certificateData },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/ledger/[batchId]:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
