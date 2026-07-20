import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

import { negosiasiSchema } from "@/lib/validations/negosiasi.schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ wtbId: string }> },
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

    const { wtbId } = await params;

    const negosiasi = await prisma.negosiasi.findMany({
      where: { wtbId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      { message: "Data Negosiasi berhasil diambil.", data: negosiasi },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/wtb/[wtbId]/negosiasi:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ wtbId: string }> },
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

    const { wtbId } = await params;
    const body = await req.json();

    // zod validation
    const parsed = negosiasiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { offeredPrice, note } = parsed.data;

    // Cek apakah wtbId ada
    const wtbListing = await prisma.wtbListing.findUnique({
      where: { id: wtbId },
    });

    if (!wtbListing) {
      return NextResponse.json(
        { error: `WTB Listing dengan ID ${wtbId} tidak ditemukan.` },
        { status: 404 },
      );
    }

    const newNego = await prisma.negosiasi.create({
      data: {
        wtbId,
        senderRole: session.user.role, // <-- Use role from session
        offeredPrice,
        note,
      },
    });

    return NextResponse.json(
      { message: "Harga nego berhasil ditawarkan.", data: newNego },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/wtb/[wtbId]/negosiasi:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
