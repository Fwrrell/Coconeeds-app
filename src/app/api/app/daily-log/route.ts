import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { dailyLogSchema } from "@/lib/validations/daily-log.schema";

// POST a new daily log
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsed = dailyLogSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
        }

        const { lahanId, ...data } = parsed.data;

        // verify user owns the lahan
        const lahan = await prisma.lahan.findFirst({
            where: {
                id: lahanId,
                petaniId: session.user.id,
            }
        });

        if (!lahan) {
            return NextResponse.json({ error: "Lahan not found or you do not have access." }, { status: 404 });
        }

        const newLog = await prisma.dailyLog.create({
            data: {
                ...data,
                lahanId,
                petaniId: session.user.id,
                tanggal: new Date(data.tanggal),
            }
        });

        // Here, you could trigger a re-calculation for the AI yield forecast
        // For now, we just return success
        
        return NextResponse.json(newLog, { status: 201 });

    } catch (error) {
        console.error("Error creating daily log:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
