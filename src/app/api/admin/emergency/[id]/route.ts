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

    const callout = await db.emergencyCallout.findUnique({
      where: { id },
    });

    if (!callout) {
      return NextResponse.json({ error: "Emergency callout not found" }, { status: 404 });
    }

    return NextResponse.json({ callout });
  } catch (error) {
    console.error("Failed to fetch emergency callout:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency callout" },
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
    const { status, resolvedBy } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === "resolved") {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = session.user.name || "Admin";
      }
    }

    const callout = await db.emergencyCallout.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, callout });
  } catch (error) {
    console.error("Failed to update emergency callout:", error);
    return NextResponse.json(
      { error: "Failed to update emergency callout" },
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

    await db.emergencyCallout.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete emergency callout:", error);
    return NextResponse.json(
      { error: "Failed to delete emergency callout" },
      { status: 500 }
    );
  }
}
