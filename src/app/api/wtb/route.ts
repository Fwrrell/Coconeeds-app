import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// schema validation
const wtbSchema = z.object({
  perusahaanId: z.string().min(1, "ID Perusahaan wajib diisi"),
  komoditas: z.string().min(1, "Komoditas wajib diisi"),
  targetWeight: z.coerce.number().positive("Target berat harus bernilai positif"),
  maxPrice: z.coerce.number().positive("Harga maksimal harus bernilai positif"),
  destination: z.string().min(1, "Tujuan pengiriman wajib diisi"),
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

    const body = await req.json();

    // zod validation
    const parsed = wtbSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { perusahaanId, komoditas, targetWeight, maxPrice, destination } = parsed.data;

    // role & authorization check: perusahaan hanya boleh buat data untuk diri sendiri, admin bebas
    if (session.user.role === "PERUSAHAAN" && session.user.id !== perusahaanId) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk membuat WTB atas nama perusahaan lain." },
        { status: 403 },
      );
    }

    if (session.user.role !== "PERUSAHAAN" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya Perusahaan dan Admin yang diperbolehkan membuat listing WTB." },
        { status: 403 },
      );
    }

    const newWtb = await prisma.wtbListing.create({
      data: {
        perusahaanId,
        komoditas,
        targetWeight,
        maxPrice,
        destination,
      },
    });

    return NextResponse.json(
      { message: "Data WTB berhasil dibuat.", data: newWtb },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/wtb:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // auth check
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    // ambil semua list WTB yang masih OPEN
    const wtbList = await prisma.wtbListing.findMany({
      where: { status: "OPEN" },
      include: {
        perusahaan: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { message: "Data WTB berhasil diambil.", data: wtbList },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/wtb:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
