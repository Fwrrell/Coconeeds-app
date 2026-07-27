import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status, dealPrice } = await request.json();

    const wtbListing = await prisma.wtbListing.findUnique({
      where: { id },
    });

    if (!wtbListing) {
      return NextResponse.json(
        { error: "WTB Listing not found" },
        { status: 404 },
      );
    }

    const updatedWtbListing = await prisma.wtbListing.update({
      where: { id },
      data: {
        status: status || wtbListing.status, // Update status jika diberikan
        dealPrice: dealPrice !== undefined ? dealPrice : wtbListing.dealPrice, // Update dealPrice jika diberikan
      },
    });

    return NextResponse.json({
      data: updatedWtbListing,
      message: "WTB Listing updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating WTB Listing:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: "Failed to update WTB Listing", error: message },
      { status: 500 },
    );
  }
}
