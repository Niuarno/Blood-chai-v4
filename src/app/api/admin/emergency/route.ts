import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const callouts = await db.emergencyCallout.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ callouts });
  } catch (error) {
    console.error("Failed to fetch emergency callouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency callouts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { bloodGroup, location, hospitalName, contactNumber, description } = body;

    const callout = await db.emergencyCallout.create({
      data: {
        bloodGroup,
        location,
        hospitalName,
        contactNumber,
        description,
      },
    });

    return NextResponse.json({ callout });
  } catch (error) {
    console.error("Failed to create emergency callout:", error);
    return NextResponse.json(
      { error: "Failed to create emergency callout" },
      { status: 500 }
    );
  }
}
