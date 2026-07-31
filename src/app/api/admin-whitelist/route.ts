
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch all whitelisted emails
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const whitelist = await prisma.adminWhitelist.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: whitelist });
  } catch (error) {
    console.error("Error fetching whitelist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add a new email to the whitelist
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email provided" }, { status: 400 });
    }

    const newEntry = await prisma.adminWhitelist.create({
      data: {
        email: email.toLowerCase(),
        addedBy: session.user.email, // Track which admin added the email
      },
    });

    return NextResponse.json({ message: "Email added to whitelist", data: newEntry }, { status: 201 });
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email already exists in the whitelist" }, { status: 409 });
    }
    console.error("Error adding to whitelist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove an email from the whitelist
export async function DELETE(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  
    try {
      const { email } = await req.json();
      if (!email || typeof email !== "string") {
        return NextResponse.json({ error: "Invalid email provided" }, { status: 400 });
      }
  
      await prisma.adminWhitelist.delete({
        where: { email: email.toLowerCase() },
      });
  
      return NextResponse.json({ message: "Email removed from whitelist" }, { status: 200 });
    } catch (error: any) {
        // Handle case where record to delete is not found
        if (error.code === 'P2025') {
            return NextResponse.json({ error: "Email not found in whitelist" }, { status: 404 });
        }
      console.error("Error deleting from whitelist:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
