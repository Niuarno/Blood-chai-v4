import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const division = searchParams.get("division");
    const district = searchParams.get("district");

    const where: any = { isActive: true };

    if (division) {
      where.division = division;
    }

    if (district) {
      where.district = district;
    }

    const bloodBanks = await db.bloodBank.findMany({
      where,
      orderBy: [{ division: "asc" }, { district: "asc" }],
    });

    return NextResponse.json({ bloodBanks });
  } catch (error) {
    console.error("Failed to fetch blood banks:", error);
    return NextResponse.json(
      { error: "Failed to fetch blood banks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { banks } = body;

    if (banks && Array.isArray(banks)) {
      // Bulk insert
      const created = await db.bloodBank.createMany({
        data: banks,
        skipDuplicates: true,
      });
      return NextResponse.json({ created });
    } else {
      // Single insert
      const { name, division, district, address, phone, email, operatingHours, mapUrl } = body;
      
      const bloodBank = await db.bloodBank.create({
        data: {
          name,
          division,
          district,
          address,
          phone,
          email,
          operatingHours,
          mapUrl,
        },
      });

      return NextResponse.json({ bloodBank });
    }
  } catch (error) {
    console.error("Failed to create blood bank:", error);
    return NextResponse.json(
      { error: "Failed to create blood bank" },
      { status: 500 }
    );
  }
}
