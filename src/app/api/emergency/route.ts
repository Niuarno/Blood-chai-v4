import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bloodGroup,
      hospitalName,
      location,
      division,
      district,
      contactNumber,
      patientName,
      description,
    } = body;

    // Validate required fields
    if (!bloodGroup || !hospitalName || !location || !contactNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const callout = await db.emergencyCallout.create({
      data: {
        bloodGroup,
        hospitalName,
        location,
        contactNumber,
        description,
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      callout,
    });
  } catch (error) {
    console.error("Failed to create emergency request:", error);
    return NextResponse.json(
      { error: "Failed to submit emergency request" },
      { status: 500 }
    );
  }
}
