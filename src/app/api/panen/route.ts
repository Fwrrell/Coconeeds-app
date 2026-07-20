import { NextResponse } from "next/server";
import { PengirimanMethod, PanenStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

import { panenSchema } from "@/lib/validations/panen.schema";

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

    const body = await req.json();

    // zod validation
    const parsed = panenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { petaniId, type, expectedWeight, tanggalPanen, pengirimanMethod } = parsed.data;

    // role & authorization check
    // 1. ADMIN can create for any petani
    // 2. PETANI can only create for themselves
    // 3. Other roles (e.g., PERUSAHAAN) are not allowed
    if (session.user.role === "PETANI" && session.user.id !== petaniId) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk membuat data panen atas nama user lain." },
        { status: 403 },
      );
    }
    if (session.user.role !== "PETANI" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin untuk membuat data panen." },
        { status: 403 },
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
        expectedWeight,
        tanggalPanen,
        pengirimanMethod,
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
    // auth check
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    // ambil query param dari URL (misal: ?petaniId=xxx atau ?status=pending)
    const { searchParams } = new URL(req.url);
    const petaniId = searchParams.get("petaniId");
    const status = searchParams.get("status");

    // authorization check: petani hanya boleh melihat riwayat dia sendiri
    if (session.user.role === "PETANI") {
      if (!petaniId || session.user.id !== petaniId) {
        return NextResponse.json(
          { error: "Anda hanya diperbolehkan melihat riwayat panen Anda sendiri." },
          { status: 403 },
        );
      }
    }

    const queryOptions: any = {
      orderBy: { createdAt: "desc" }, // urutkan data dari terbaru
      include: {
        // JOIN untuk mengambil data petani untuk dashboard admin/kopdes
        petani: {
          select: { name: true, location: true },
        },
      },
    };

    if (petaniId) {
      // page petani request API untuk melihat riwayat setor dia
      queryOptions.where = { petaniId: petaniId };
    } else if (status === "pending") {
      // page admin req daftar barang yang harus di urus hari ini
      queryOptions.where = {
        status: {
          in: [PanenStatus.PENDING_PICKUP, PanenStatus.PENDING_DROPOFF],
        },
      };
    }

    // ambil data
    const dataPanen = await prisma.panen.findMany(queryOptions);

    return NextResponse.json(
      { message: "Berhasil mengambil data panen.", data: dataPanen },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/panen:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
