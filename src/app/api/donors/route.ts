import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const bloodGroup = searchParams.get("bloodGroup");

    // Build filter conditions
    const where: any = {
      isAvailable: true,
    };

    if (division) {
      where.division = division;
    }

    if (district) {
      where.district = district;
    }

    if (bloodGroup) {
      where.bloodGroup = bloodGroup;
    }

    const donors = await db.donor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ donors });
  } catch (error) {
    console.error("Failed to fetch donors:", error);
    return NextResponse.json(
      { error: "Failed to fetch donors" },
      { status: 500 }
    );
  }
}
