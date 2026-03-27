import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const donor = await db.donor.findUnique({
      where: { userId: session.user.id },
    });

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    const donations = await db.donation.findMany({
      where: { donorId: donor.id },
      orderBy: { donationDate: "desc" },
    });

    return NextResponse.json({ donations });
  } catch (error) {
    console.error("Failed to fetch donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
