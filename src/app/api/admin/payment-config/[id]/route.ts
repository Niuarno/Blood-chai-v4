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

    const config = await db.paymentConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return NextResponse.json({ error: "Payment config not found" }, { status: 404 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Failed to fetch payment config:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment config" },
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
    const { method, accountName, accountNumber, instructions, isActive } = body;

    const updateData: any = {};

    if (method) updateData.method = method;
    if (accountName) updateData.accountName = accountName;
    if (accountNumber) updateData.accountNumber = accountNumber;
    if (instructions) updateData.instructions = instructions;
    if (isActive !== undefined) updateData.isActive = isActive;

    const config = await db.paymentConfig.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Failed to update payment config:", error);
    return NextResponse.json(
      { error: "Failed to update payment config" },
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

    await db.paymentConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete payment config:", error);
    return NextResponse.json(
      { error: "Failed to delete payment config" },
      { status: 500 }
    );
  }
}
