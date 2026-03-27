import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Fetch current donor profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const donor = await db.donor.findUnique({
      where: { userId: session.user.id },
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

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json({ donor });
  } catch (error) {
    console.error("Failed to fetch donor:", error);
    return NextResponse.json(
      { error: "Failed to fetch donor profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update donor profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      bloodGroup,
      division,
      district,
      area,
      address,
      emergencyPhone,
      isAvailable,
      profileImage,
    } = body;

    const donor = await db.donor.findUnique({
      where: { userId: session.user.id },
    });

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    const updateData: any = {};
    
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (division !== undefined) updateData.division = division;
    if (district !== undefined) updateData.district = district;
    if (area !== undefined) updateData.area = area;
    if (address !== undefined) updateData.address = address;
    if (emergencyPhone !== undefined) updateData.emergencyPhone = emergencyPhone;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const updatedDonor = await db.donor.update({
      where: { userId: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ donor: updatedDonor });
  } catch (error) {
    console.error("Failed to update donor:", error);
    return NextResponse.json(
      { error: "Failed to update donor profile" },
      { status: 500 }
    );
  }
}
