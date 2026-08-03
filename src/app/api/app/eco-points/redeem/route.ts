import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redeemRewardSchema } from "@/lib/validations/eco-points.schema";
import { EcoPointTxType } from "@prisma/client";
import { randomBytes } from "crypto";

// POST to redeem a reward
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsed = redeemRewardSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
        }

        const { rewardId } = parsed.data;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get user and reward details
            const user = await tx.user.findUnique({ where: { id: session.user.id! } });
            const reward = await tx.rewardCatalog.findUnique({ where: { id: rewardId } });

            if (!user) throw new Error("User tidak ditemukan.");
            if (!reward) throw new Error("Hadiah tidak ditemukan.");
            if (user.ecoPoints < reward.costPoints) throw new Error("Poin tidak mencukupi.");

            // 2. Deduct points
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { ecoPoints: { decrement: reward.costPoints } },
            });

            // 3. Log the transaction
            const voucherCode = `VCR-${randomBytes(4).toString('hex').toUpperCase()}`;
            const newTx = await tx.ecoPointTx.create({
                data: {
                    petaniId: user.id,
                    type: EcoPointTxType.REDEEM,
                    points: -reward.costPoints,
                    activity: `Redeem ${reward.title}`,
                    rewardId: reward.id,
                    voucherCode: voucherCode,
                }
            });

            return { newTx, updatedUser };
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error: any) {
        console.error("Error redeeming reward:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
