import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// GET - Fetch requests (for donor, recipient, or admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let where: any = {};

    // Role-based filtering
    if (session.user.role === "admin") {
      // Admin can see all
      if (status) {
        where.status = status;
      }
    } else if (session.user.role === "donor") {
      // Donor sees requests sent to them
      const donor = await db.donor.findUnique({
        where: { userId: session.user.id },
      });
      
      if (!donor) {
        return NextResponse.json({ error: "Donor not found" }, { status: 404 });
      }

      where.donorId = donor.id;
      if (status) {
        where.status = status;
      }
    } else {
      // Recipient sees their sent requests
      where.requesterId = session.user.id;
      if (status) {
        where.status = status;
      }
    }

    const requests = await db.bloodRequest.findMany({
      where,
      include: {
        donor: {
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
        recipient: {
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
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Failed to fetch requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// POST - Create a new blood request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      donorId,
      bloodGroup,
      patientName,
      hospitalName,
      hospitalAddress,
      contactNumber,
      urgency,
      notes,
      isEmergency = false,
      // New user registration fields
      name,
      email,
      phone,
      password,
    } = body;

    // Validate required fields
    if (!donorId || !bloodGroup || !patientName || !hospitalName || !contactNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let requesterId: string;
    let recipientId: string | null = null;
    let isNewUser = false;
    let newUserCredentials: { email: string; password: string } | null = null;

    if (session?.user?.id) {
      // User is logged in
      requesterId = session.user.id;

      // Check if recipient profile exists
      let recipient = await db.recipient.findUnique({
        where: { userId: session.user.id },
      });

      if (!recipient) {
        // Create recipient profile
        recipient = await db.recipient.create({
          data: {
            userId: session.user.id,
          },
        });
      }

      recipientId = recipient.id;
    } else if (email && password) {
      // New user registration with provided credentials
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // User exists, use their account
        requesterId = existingUser.id;
        
        let recipient = await db.recipient.findUnique({
          where: { userId: existingUser.id },
        });

        if (!recipient) {
          recipient = await db.recipient.create({
            data: {
              userId: existingUser.id,
            },
          });
        }

        recipientId = recipient.id;
      } else {
        // Create new user with provided credentials
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await db.user.create({
          data: {
            email,
            password: hashedPassword,
            name: name || patientName,
            phone: phone || contactNumber,
            role: "recipient",
          },
        });

        const recipient = await db.recipient.create({
          data: {
            userId: newUser.id,
          },
        });

        requesterId = newUser.id;
        recipientId = recipient.id;
        isNewUser = true;
        newUserCredentials = { email, password };
      }
    } else {
      // Auto-create account for new users without credentials
      const autoEmail = `recipient_${Date.now()}@bloodchai.org`;
      const autoPassword = uuidv4().substring(0, 8);
      const hashedPassword = await bcrypt.hash(autoPassword, 12);

      const newUser = await db.user.create({
        data: {
          email: autoEmail,
          password: hashedPassword,
          name: patientName,
          phone: contactNumber,
          role: "recipient",
        },
      });

      const recipient = await db.recipient.create({
        data: {
          userId: newUser.id,
        },
      });

      requesterId = newUser.id;
      recipientId = recipient.id;
      isNewUser = true;
      newUserCredentials = { email: autoEmail, password: autoPassword };
    }

    // Create the blood request
    const bloodRequest = await db.bloodRequest.create({
      data: {
        requesterId,
        recipientId,
        donorId,
        bloodGroup,
        patientName,
        hospitalName,
        hospitalAddress: hospitalAddress || "",
        contactNumber,
        urgency,
        notes,
        isEmergency,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      request: bloodRequest,
      isNewUser,
      credentials: newUserCredentials,
    });
  } catch (error) {
    console.error("Failed to create request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
