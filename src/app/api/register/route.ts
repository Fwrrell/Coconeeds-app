import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/register.schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    const session = await auth();

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { name, phoneNumber, pin, kopdesId } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Nomor HP sudah terdaftar." },
        { status: 409 }
      );
    }
    
    const hashedPin = await bcrypt.hash(pin, 10);
    
    // petani ga bs pilih kopdes sndiri, ntar diassign admin waktu approve
    const assignedKopdesId = session?.user?.role === 'ADMIN' ? (kopdesId || null) : null;
    const isVerified = session?.user?.role === 'ADMIN';

    const newUser = await prisma.user.create({
      data: {
        name,
        phoneNumber,
        pin: hashedPin,
        isVerified: isVerified || false,
        approvalStatus: isVerified ? "APPROVED" : "PENDING",
        kopdesId: assignedKopdesId,
      },
    });

    const { pin: _, ...userWithoutPin } = newUser;

    return NextResponse.json(
      { data: userWithoutPin, message: "Akun petani berhasil dibuat." },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_API_ERROR:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat menyimpan data." },
      { status: 500 }
    );
  }
}
