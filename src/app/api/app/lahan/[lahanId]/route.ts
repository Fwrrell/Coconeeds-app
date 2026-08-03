import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateLahanSchema } from "@/lib/validations/lahan.schema";

// get single lahan
export async function GET(
  req: Request,
  { params }: { params: Promise<{ lahanId: string }> },
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { lahanId } = await params;
    const lahan = await prisma.lahan.findUnique({
      where: {
        id: lahanId,
        petaniId: session.user.id, // ensure user owns this lahan
      },
    });

    if (!lahan) {
      return NextResponse.json({ error: "Lahan not found" }, { status: 404 });
    }

    return NextResponse.json(lahan);
  } catch (error) {
    console.error("Error getting lahan detail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// update lahan
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ lahanId: string }> },
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { lahanId } = await params;
    const body = await req.json();
    const parsed = updateLahanSchema.safeParse(body);

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

    // Cek dulu user punya akses ke lahan ini
    const existingLahan = await prisma.lahan.findFirst({
      where: {
        id: lahanId,
        petaniId: session.user.id,
      },
    });

    if (!existingLahan) {
      return NextResponse.json(
        { error: "Lahan not found or you don't have access" },
        { status: 404 },
      );
    }

    const updatedLahan = await prisma.lahan.update({
      where: {
        id: lahanId,
      },
      data: {
        namaLahan,
        luasM2,
        jumlahPohon,
        lokasiAddress,
        tanggalTanam: tanggalTanam ? new Date(tanggalTanam) : undefined,
        pupuk,
        deskripsi,
      },
    });

    return NextResponse.json(updatedLahan);
  } catch (error) {
    console.error("Error updating lahan:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// delete lahan
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ lahanId: string }> },
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { lahanId } = await params;

    // Cek dulu user punya akses ke lahan ini
    const existingLahan = await prisma.lahan.findFirst({
      where: {
        id: lahanId,
        petaniId: session.user.id,
      },
    });

    if (!existingLahan) {
      return NextResponse.json(
        { error: "Lahan not found or you don't have access" },
        { status: 404 },
      );
    }

    await prisma.lahan.delete({
      where: {
        id: lahanId,
      },
    });

    return NextResponse.json(
      { message: "Lahan deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting lahan:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
