import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { lahanSchema } from "@/lib/validations/lahan.schema";

// get all lahan for logged in petani
export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lahanList = await prisma.lahan.findMany({
      where: {
        petaniId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(lahanList);
  } catch (error) {
    console.error("Error getting lahan:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// create new lahan
export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = lahanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 },
      );
    }

    const {
      namaLahan,
      luasM2,
      jumlahPohon,
      lokasiAddress,
      tanggalTanam,
      pupuk,
      deskripsi,
    } = parsed.data;

    const newLahan = await prisma.lahan.create({
      data: {
        petaniId: session.user.id,
        namaLahan,
        luasM2,
        jumlahPohon,
        lokasiAddress,
        tanggalTanam: tanggalTanam ? new Date(tanggalTanam) : null,
        pupuk,
        deskripsi,
      },
    });

    return NextResponse.json(newLahan, { status: 201 });
  } catch (error) {
    console.error("Error creating lahan:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
