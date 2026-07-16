import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phoneNumber, pin } = body;

    // input validation
    if (!name || !phoneNumber || !pin) {
      return NextResponse.json(
        {
          message: "Data tidak Lengkap. Mohon isi semua field.",
        },
        { status: 400 },
      );
    }

    // cek dupe account
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (existingUser) {
      return NextResponse.json(
        {
          message: "Nomor HP ini sudah terdaftar. Silahkan login.",
        },
        { status: 409 },
      );
    }

    // hash PIN
    const saltRounds = 10;
    const hashedPin = await bcrypt.hash(pin, saltRounds);

    // save user ke db
    const newUser = await prisma.user.create({
      data: {
        name,
        phoneNumber,
        pin: hashedPin,
        role: "PETANI",
      },
    });

    return NextResponse.json(
      { message: "Pendaftaraan berhasil!", userId: newUser.id },
      { status: 201 },
    );
  } catch (err) {
    console.error("REGISTER_API_ERROR:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada sistem. Coba beberapa saat lagi." },
      { status: 500 },
    );
  }
}
