import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { WtbStatus } from "@prisma/client";
import { wtbSchema } from "@/lib/validations/wtb.schema";

// buat wtb listing baru dgn spesifikasi dan deadline
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    const body = await req.json();

    const parsed = wtbSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { perusahaanId, komoditas, spesifikasi, targetWeight, maxPrice, destination, deadline } = parsed.data;

    if (session.user.role === "PERUSAHAAN" && session.user.id !== perusahaanId) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk membuat WTB atas nama perusahaan lain." },
        { status: 403 },
      );
    }

    if (session.user.role !== "PERUSAHAAN" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya Perusahaan dan Admin yang diperbolehkan membuat listing WTB." },
        { status: 403 },
      );
    }

    const deadlineDate = deadline ? new Date(deadline) : null;

    const newWtb = await prisma.wtbListing.create({
      data: {
        perusahaanId,
        komoditas,
        spesifikasi,
        targetWeight,
        maxPrice,
        destination,
        deadline: deadlineDate,
      },
    });

    return NextResponse.json(
      { message: "Data WTB berhasil dibuat.", data: newWtb },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/wtb:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}

// fetch data wtb asli dari db dgn relasi & ngitung total pasokan dari batch
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Autentikasi diperlukan." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as WtbStatus | null;
    const perusahaanIdParam = searchParams.get("perusahaanId");

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    // cegah bocor data: klo role PERUSAHAAN paksa filter ke session.user.id
    if (session.user.role === "PERUSAHAAN") {
      whereClause.perusahaanId = session.user.id;
    } else if (perusahaanIdParam) {
      whereClause.perusahaanId = perusahaanIdParam;
    }

    const wtbList = await prisma.wtbListing.findMany({
      where: whereClause,
      include: {
        perusahaan: {
          select: { name: true, image: true, companyAddress: true, penanggungJawab: true },
        },
        negosiasi: {
          include: {
            kopdes: { select: { id: true, name: true, region: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        batches: {
          include: {
            kopdes: { select: { id: true, name: true } },
            pengirimanKapal: true,
          },
        },
        _count: {
          select: { negosiasi: true, batches: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // kalkulasi collectedWeight & kopdesJoined dr batch
    const mappedList = wtbList.map((wtb) => {
      const collectedWeight = wtb.batches.reduce((sum, b) => sum + (b.totalWeight || 0), 0);
      const kopdesSet = new Set(wtb.batches.map((b) => b.kopdesId).filter(Boolean));
      const kopdesJoined = kopdesSet.size;

      return {
        ...wtb,
        collectedWeight,
        kopdesJoined,
      };
    });

    return NextResponse.json(
      { message: "Data WTB berhasil diambil.", data: mappedList },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/wtb:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
