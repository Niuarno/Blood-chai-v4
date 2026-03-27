import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const donor = await db.donor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        donations: {
          orderBy: { donationDate: "desc" },
          take: 10,
        },
        reports: {
          include: {
            reporter: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json({ donor });
  } catch (error) {
    console.error("Failed to fetch donor:", error);
    return NextResponse.json(
      { error: "Failed to fetch donor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { points, isAvailable, name, phone } = body;

    // Update donor
    const updateData: any = {};

    if (points !== undefined) updateData.points = points;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const donor = await db.donor.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Update user info if provided
    if (name || phone) {
      await db.user.update({
        where: { id: donor.userId },
        data: {
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
        },
      });
    }

    return NextResponse.json({ success: true, donor });
  } catch (error) {
    console.error("Failed to update donor:", error);
    return NextResponse.json(
      { error: "Failed to update donor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // This will cascade delete related records due to schema relations
    await db.donor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete donor:", error);
    return NextResponse.json(
      { error: "Failed to delete donor" },
      { status: 500 }
    );
  }
}
