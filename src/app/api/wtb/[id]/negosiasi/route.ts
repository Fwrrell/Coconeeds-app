import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

import { negosiasiSchema } from "@/lib/validations/negosiasi.schema";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }, // Diganti ke { id: string }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    const { id } = params; // Menggunakan id

    const negosiasi = await prisma.negosiasi.findMany({
      where: { wtbId: id }, // Mencari berdasarkan id
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      { message: "Data Negosiasi berhasil diambil.", data: negosiasi },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/wtb/[id]/negosiasi:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }, // Diganti ke { id: string }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    const { id } = params; // Menggunakan id
    const body = await req.json();

    const parsed = negosiasiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { offeredPrice, note } = parsed.data;

    const wtbListing = await prisma.wtbListing.findUnique({
      where: { id },
    });

    if (!wtbListing) {
      return NextResponse.json(
        { error: `WTB Listing dengan ID ${id} tidak ditemukan.` },
        { status: 404 },
      );
    }

    const newNego = await prisma.negosiasi.create({
      data: {
        wtbId: id, // Menggunakan id
        senderRole: session.user.role,
        offeredPrice,
        note,
      },
    });

    return NextResponse.json(
      { message: "Harga nego berhasil ditawarkan.", data: newNego },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/wtb/[id]/negosiasi:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
