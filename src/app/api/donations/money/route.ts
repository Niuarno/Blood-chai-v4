import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      donorName,
      donorEmail,
      donorPhone,
      amount,
      paymentMethod,
      transactionId,
      notes,
    } = body;

    // Validate required fields
    if (!donorName || !donorPhone || !amount || !paymentMethod || !transactionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const donation = await db.moneyDonation.create({
      data: {
        donorName,
        donorEmail,
        donorPhone,
        amount: parseFloat(amount),
        paymentMethod,
        transactionId,
        notes,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error("Failed to record donation:", error);
    return NextResponse.json(
      { error: "Failed to record donation" },
      { status: 500 }
    );
  }
}
