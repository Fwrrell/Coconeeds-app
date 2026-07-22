import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kopdesSchema } from "@/lib/validations/kopdes.schema";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
        return NextResponse.json({ error: "ID tidak ditemukan." }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = kopdesSchema.parse(body);

    const updatedKopdes = await prisma.kopdes.update({
      where: { id },
      data: {
        name: validatedData.name,
        region: validatedData.region,
      },
    });

    return NextResponse.json(
      { data: updatedKopdes, message: "Kopdes berhasil diperbarui." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    // Handle case where kopdes is not found
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        return NextResponse.json({ error: "Kopdes tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
        return NextResponse.json({ error: "ID tidak ditemukan." }, { status: 400 });
    }

    // Check if there are users associated with this Kopdes
    const userCount = await prisma.user.count({ where: { kopdesId: id }});
    if (userCount > 0) {
        return NextResponse.json({ error: "Tidak dapat menghapus Kopdes yang masih memiliki petani terdaftar." }, { status: 409 });
    }

    await prisma.kopdes.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Kopdes berhasil dihapus." },
      { status: 200 }
    );
  } catch (error) {
     if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        return NextResponse.json({ error: "Kopdes tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}
