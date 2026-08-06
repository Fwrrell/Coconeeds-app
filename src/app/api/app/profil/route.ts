import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// fetch data profil user login n saldo wallet
export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        approvalStatus: true,
        isVerified: true,
        ecoPoints: true,
        wallet: {
          select: {
            id: true,
            balance: true,
          },
        },
        kopdes: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // auto create wallet klo user blm ada dompet idr
    if (!user.wallet) {
      const newWallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0,
        },
      });
      user = {
        ...user,
        wallet: {
          id: newWallet.id,
          balance: newWallet.balance,
        },
      };
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error getting profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// update profil nama n no hp petani
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phoneNumber } = body;

    // validasi no hp indo dlu hrus 08 depannya
    if (phoneNumber && !/^08\d{8,11}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Nomor HP harus diawali '08' dan berisi 10-13 digit angka." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(phoneNumber && { phoneNumber }),
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        approvalStatus: true,
        isVerified: true,
        ecoPoints: true,
        wallet: {
          select: {
            id: true,
            balance: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
