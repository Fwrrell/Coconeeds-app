import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// schema validation
const pengirimanSchema = z.object({
  namaKapal: z.string().min(1, "Nama kapal wajib diisi"),
  rute: z.string().min(1, "Rute pengiriman wajib diisi"),
  totalBiaya: z.coerce.number().positive("Total biaya harus bernilai positif"),
  batchIds: z.array(z.string().min(1)).min(1, "Minimal pilih 1 batch pengiriman"),
});

export async function POST(req: Request) {
  try {
    // auth check
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    // role check: only ADMIN can manage shipments
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk membuat pengiriman." },
        { status: 403 },
      );
    }

    const body = await req.json();

    // zod validation
    const parsed = pengirimanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { namaKapal, rute, totalBiaya, batchIds } = parsed.data;

    // ambil data batch beserta data panen dan lokasi petani
    const batches = await prisma.batch.findMany({
      where: { id: { in: batchIds } },
      include: {
        panens: {
          include: {
            petani: {
              select: { location: true },
            },
          },
        },
      },
    });

    if (batches.length === 0) {
      return NextResponse.json(
        { error: "Batch tidak ditemukan." },
        { status: 404 },
      );
    }

    // logic calculate: kelompokkan berat berdasarkan lokasi
    let totalWeightKapal = 0;
    const locationWeights: Record<string, number> = {};

    for (const batch of batches) {
      totalWeightKapal += batch.totalWeight;

      // hitung berat yang disumbang per lokasi dalam 1 batch
      for (const panen of batch.panens) {
        const lokasiDesa = panen.petani.location || "Lokasi tidak diketahui";

        // pake actualWeight (berat setelah QC), mencegah potensi actualWeight 0 kita bisa ambil berat perhitungan petani
        const beratPanen = panen.actualWeight || panen.expectedWeight;

        if (!locationWeights[lokasiDesa]) {
          locationWeights[lokasiDesa] = 0;
        }
        locationWeights[lokasiDesa] += beratPanen;
      }
    }

    // execute db
    const result = await prisma.$transaction(async (tx) => {
      // record pengiriman kapal
      const kapal = await tx.pengirimanKapal.create({
        data: {
          namaKapal,
          rute,
          totalBiaya: totalBiaya,
          totalWeight: totalWeightKapal,
          status: "WAITING_DEPARTURE",
        },
      });

      // update batch masukkin id kapal ke batch dan ubah statusnya
      await tx.batch.updateMany({
        where: { id: { in: batchIds } },
        data: {
          pengirimanKapalId: kapal.id,
          status: "IN_TRANSIT",
        },
      });

      // hitung proporsi tagihan (split bill sesuai beban yang disumbang) + bikin record
      const splitBillsData = Object.entries(locationWeights).map(
        ([lokasi, weightDesa]) => {
          // rumus: (berat desa / total berat) * total biaya
          const amountToPay =
            (weightDesa / totalWeightKapal) * totalBiaya;

          return {
            pengirimanKapalId: kapal.id,
            lokasiKopdes: lokasi,
            weight: weightDesa,
            amountToPay: amountToPay,
          };
        },
      );

      // insert semua data tagihan
      await tx.splitBill.createMany({
        data: splitBillsData,
      });

      return kapal;
    });

    return NextResponse.json(
      {
        message: "Pengiriman dan Split Bill berhasil dibuat.",
        data: result,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/pengiriman:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
