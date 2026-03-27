import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      emergencyPhone,
      password,
      bloodGroup,
      dateOfBirth,
      gender,
      division,
      district,
      area,
      address,
    } = body;

    // Validate required fields
    if (!email || !password || !name || !bloodGroup || !division || !district) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and donor profile in a transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: "donor",
        },
      });

      const donor = await tx.donor.create({
        data: {
          userId: newUser.id,
          bloodGroup,
          dateOfBirth,
          gender,
          division,
          district,
          area,
          address,
          emergencyPhone,
        },
      });

      return { ...newUser, donor };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Donor registration error:", error);
    return NextResponse.json(
      { error: "Failed to register donor" },
      { status: 500 }
    );
  }
}
