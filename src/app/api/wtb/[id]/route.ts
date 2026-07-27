import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth'; // Import auth dari '@/lib/auth'
import { Role } from '@prisma/client';

// Endpoint PATCH untuk update WtbListing (misal: set status ke DEAL dan dealPrice)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth(); // Gunakan auth() untuk mendapatkan sesi

    if (!session || !session.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status, dealPrice } = await request.json();

    const wtbListing = await prisma.wtbListing.findUnique({
      where: { id },
    });

    if (!wtbListing) {
      return NextResponse.json({ message: 'WTB Listing not found' }, { status: 404 });
    }

    const updatedWtbListing = await prisma.wtbListing.update({
      where: { id },
      data: {
        status: status || wtbListing.status, // Update status jika diberikan
        dealPrice: dealPrice !== undefined ? dealPrice : wtbListing.dealPrice, // Update dealPrice jika diberikan
      },
    });

    return NextResponse.json({ data: updatedWtbListing, message: 'WTB Listing updated successfully' });
  } catch (error) {
    console.error('Error updating WTB Listing:', error);
    return NextResponse.json(
      { message: 'Failed to update WTB Listing', error: error.message },
      { status: 500 }
    );
  }
}
