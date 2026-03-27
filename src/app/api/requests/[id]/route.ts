import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, declineReason, approvedByRecipient } = body;

    const bloodRequest = await db.bloodRequest.findUnique({
      where: { id },
      include: { donor: true },
    });

    if (!bloodRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Handle different actions
    if (action === "accept") {
      // Only donor can accept
      const donor = await db.donor.findUnique({
        where: { userId: session.user.id },
      });

      if (!donor || donor.id !== bloodRequest.donorId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const updatedRequest = await db.bloodRequest.update({
        where: { id },
        data: {
          status: "accepted",
          donorResponse: "accept",
          donorResponseAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, request: updatedRequest });
    }

    if (action === "decline") {
      // Only donor can decline
      const donor = await db.donor.findUnique({
        where: { userId: session.user.id },
      });

      if (!donor || donor.id !== bloodRequest.donorId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const updatedRequest = await db.bloodRequest.update({
        where: { id },
        data: {
          status: "declined",
          donorResponse: "decline",
          donorResponseAt: new Date(),
          declineReason: declineReason || null,
        },
      });

      return NextResponse.json({ success: true, request: updatedRequest });
    }

    if (action === "complete") {
      // Admin marks as complete
      if (session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const updatedRequest = await db.bloodRequest.update({
        where: { id },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });

      // Create donation record and update donor stats
      if (bloodRequest.donorId) {
        await db.$transaction([
          db.donation.create({
            data: {
              donorId: bloodRequest.donorId,
              requestId: id,
              bloodGroup: bloodRequest.bloodGroup,
              recipientName: bloodRequest.patientName,
              hospitalName: bloodRequest.hospitalName,
              pointsEarned: 10,
            },
          }),
          db.donor.update({
            where: { id: bloodRequest.donorId },
            data: {
              totalDonations: { increment: 1 },
              points: { increment: 10 },
              lastDonationDate: new Date(),
              isAvailable: false, // Automatically mark unavailable
            },
          }),
        ]);
      }

      return NextResponse.json({ success: true, request: updatedRequest });
    }

    if (approvedByRecipient) {
      // Recipient confirms donation happened
      const recipient = await db.recipient.findUnique({
        where: { userId: session.user.id },
      });

      if (!recipient || recipient.id !== bloodRequest.recipientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const updatedRequest = await db.bloodRequest.update({
        where: { id },
        data: {
          approvedByRecipient: true,
          approvedAt: new Date(),
          status: "completed",
          completedAt: new Date(),
        },
      });

      // Create donation record and update donor stats
      if (bloodRequest.donorId) {
        await db.$transaction([
          db.donation.create({
            data: {
              donorId: bloodRequest.donorId,
              requestId: id,
              bloodGroup: bloodRequest.bloodGroup,
              recipientName: bloodRequest.patientName,
              hospitalName: bloodRequest.hospitalName,
              pointsEarned: 10,
            },
          }),
          db.donor.update({
            where: { id: bloodRequest.donorId },
            data: {
              totalDonations: { increment: 1 },
              points: { increment: 10 },
              lastDonationDate: new Date(),
              isAvailable: false,
            },
          }),
        ]);
      }

      return NextResponse.json({ success: true, request: updatedRequest });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
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
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bloodRequest = await db.bloodRequest.findUnique({
      where: { id },
    });

    if (!bloodRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Only requester or admin can cancel
    if (bloodRequest.requesterId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.bloodRequest.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to cancel request:", error);
    return NextResponse.json(
      { error: "Failed to cancel request" },
      { status: 500 }
    );
  }
}
