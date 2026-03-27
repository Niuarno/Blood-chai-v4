import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Fetch reports (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const reports = await db.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        reportedDonor: {
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
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST - Create report (recipient only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { donorId, requestId, reason, description } = body;

    if (!donorId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the user has a request with this donor
    const recipient = await db.recipient.findUnique({
      where: { userId: session.user.id },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Check if there's a blood request between this recipient and donor
    const bloodRequest = await db.bloodRequest.findFirst({
      where: {
        recipientId: recipient.id,
        donorId: donorId,
      },
    });

    if (!bloodRequest) {
      return NextResponse.json(
        { error: "You can only report donors you have requested blood from" },
        { status: 403 }
      );
    }

    const report = await db.report.create({
      data: {
        reporterId: session.user.id,
        reportedDonorId: donorId,
        requestId,
        reason,
        description,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Failed to create report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
