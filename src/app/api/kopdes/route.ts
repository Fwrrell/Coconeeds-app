import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kopdesSchema } from "@/lib/validations/kopdes.schema";
import { z } from "zod";

export async function GET() {
  try {
    const kopdes = await prisma.kopdes.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json({ data: kopdes, message: "Kopdes berhasil diambil." });
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = kopdesSchema.parse(body);

    const newKopdes = await prisma.kopdes.create({
      data: {
        name: validatedData.name,
        region: validatedData.region,
      },
    });

    return NextResponse.json(
      { data: newKopdes, message: "Kopdes berhasil dibuat." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}
