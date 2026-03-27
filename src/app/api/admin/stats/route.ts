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

    const [
      totalDonors,
      totalRecipients,
      totalRequests,
      pendingRequests,
      emergencyRequests,
      totalDonations,
    ] = await Promise.all([
      db.donor.count(),
      db.recipient.count(),
      db.bloodRequest.count(),
      db.bloodRequest.count({ where: { status: "pending" } }),
      db.bloodRequest.count({ where: { isEmergency: true, status: "pending" } }),
      db.donation.count(),
    ]);

    return NextResponse.json({
      stats: {
        totalDonors,
        totalRecipients,
        totalRequests,
        pendingRequests,
        emergencyRequests,
        totalDonations,
      },
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
