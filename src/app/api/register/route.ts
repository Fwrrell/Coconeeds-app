import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

import { registerSchema } from "@/lib/validations/register.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Zod validation
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, phoneNumber, pin } = parsed.data;

    // cek dupe account
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (existingUser) {
      return NextResponse.json(
        {
          error: "Nomor HP ini sudah terdaftar. Silahkan login.",
        },
        { status: 409 },
      );
    }

    // hash PIN
    const saltRounds = 10;
    const hashedPin = await bcrypt.hash(pin, saltRounds);

    // cek status toggle dari db
    const setting = await prisma.systemSetting.findUnique({
      where: { id: "global_config" },
    });

    const isAutoVerify = setting?.autoVerifyPetani ?? true;

    // save user ke db
    const newUser = await prisma.user.create({
      data: {
        name,
        phoneNumber,
        pin: hashedPin,
        role: "PETANI",
        isVerified: isAutoVerify,
      },
    });

    return NextResponse.json(
      { message: "Pendaftaraan berhasil!", data: { userId: newUser.id } },
      { status: 201 },
    );
  } catch (err) {
    console.error("REGISTER_API_ERROR:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem. Coba beberapa saat lagi." },
      { status: 500 },
    );
  }
}
