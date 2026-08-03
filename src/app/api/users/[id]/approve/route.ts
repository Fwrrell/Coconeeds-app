import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApprovalStatus } from "@prisma/client";

// PATCH: Approve or reject a user
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: userId } = await params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const { status } = await req.json();
    if (!status || !Object.values(ApprovalStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided. Must be APPROVED or REJECTED." },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        approvalStatus: status,
      },
    });

    return NextResponse.json({
      message: `User status updated to ${status}`,
      data: updatedUser,
    });
  } catch (error: any) {
    // Handle case where user to update is not found
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error(`Error updating user ${userId} status:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
