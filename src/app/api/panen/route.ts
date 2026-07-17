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
