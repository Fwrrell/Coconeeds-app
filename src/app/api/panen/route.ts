import { NextResponse } from "next/server";
import { PengirimanMethod, PanenStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { petaniId, type, expectedWeight, tanggalPanen, pengirimanMethod } =
      body;

    // validate data
    if (
      !petaniId ||
      !type ||
      !expectedWeight ||
      !tanggalPanen ||
      !pengirimanMethod
    ) {
      return NextResponse.json(
        {
          error: "Data tidak lengkap. Pastikan semua data terisi.",
        },
        { status: 400 },
      );
    }

    // section untuk menentukan status awal berdasarkan metode pengiriman
    // petani antar sendiri => PENDING_DROPOFF
    // petani req dijemput  => PENDING_PICKUP
    const initStatus =
      pengirimanMethod === "SELF_DELIVERY"
        ? PanenStatus.PENDING_DROPOFF
        : PanenStatus.PENDING_PICKUP;

    // save ke db
    const newPanen = await prisma.panen.create({
      data: {
        petaniId,
        type,
        expectedWeight: parseFloat(expectedWeight),
        tanggalPanen: new Date(tanggalPanen),
        pengirimanMethod: pengirimanMethod as PengirimanMethod,
        status: initStatus,
      },
    });

    return NextResponse.json(
      {
        message: "Data panen berhasil disubmit. Menunggu proses QC",
        data: newPanen,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/panen:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    // ambil query param dari URL (misal: ?petaniId=xxx atau ?status=pending)
    const { searchParams } = new URL(req.url);
    const petaniId = searchParams.get("petaniId");
    const status = searchParams.get("status");

    const queryOptions: any = {
      orderBy: { createdAt: "desc" }, // urutin datar dari terbaru
      include: {
        // JOIN untuk mengambil data petani. untuk keperluan dashboard admin (kopdes)
        petani: {
          select: { name: true, location: true },
        },
      },
    };

    if (petaniId) {
      // page petani request API untuk melihat riwayat setor dia
      // Keperluan: untuk membuat riwayat transaksi antara petani dengan coco
      queryOptions.where = { petaniId: petaniId };
    } else if (status === "pending") {
      // page admin req daftar barang yang harus di urus hari ini
      // Keperluan: untuk sorting ke coco hasil panen mana yang harus dikerjakan (qc) hari ini
      queryOptions.where = {
        status: {
          in: [PanenStatus.PENDING_PICKUP, PanenStatus.PENDING_DROPOFF],
        },
      };
    }

    // kalo gaada param maka kita return semua data
    const dataPanen = await prisma.panen.findMany(queryOptions);

    return NextResponse.json(
      { message: "Berhasil mengambil data panen.", dataPanen },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/panen:", err);
    return NextResponse.json(
      { message: "Terjadi error pada sistem." },
      { status: 500 },
    );
  }
}
