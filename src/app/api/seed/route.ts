import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      return NextResponse.json({ 
        message: "Admin already exists", 
        admin: { email: existingAdmin.email, name: existingAdmin.name } 
      });
    }

    // Create admin user with known credentials
    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    const admin = await db.user.create({
      data: {
        email: "admin@bloodchai.org",
        password: hashedPassword,
        name: "Admin",
        phone: "+880 1234-567890",
        role: "admin",
      },
    });

    // Create payment configurations
    const existingPayments = await db.paymentConfig.findFirst();
    if (!existingPayments) {
      await db.paymentConfig.createMany({
        data: [
          {
            method: "bkash",
            accountName: "BloodChai Foundation",
            accountNumber: "01712345678",
            instructions: "1. Open your bKash app\n2. Select 'Send Money'\n3. Enter the number: 01712345678\n4. Enter the amount\n5. Add reference: 'Donation'\n6. Confirm with your PIN",
          },
          {
            method: "nagad",
            accountName: "BloodChai Foundation",
            accountNumber: "01812345678",
            instructions: "1. Open your Nagad app\n2. Select 'Send Money'\n3. Enter the number: 01812345678\n4. Enter the amount\n5. Add reference: 'Donation'\n6. Confirm with your PIN",
          },
          {
            method: "bank",
            accountName: "BloodChai Foundation",
            accountNumber: "1234567890",
            instructions: "Bank Name: Dutch Bangla Bank\nBranch: Dhanmondi, Dhaka\nAccount Type: Savings\n\nFor international transfers:\nSWIFT Code: DBBLBDDH\nRouting Number: 123456789",
          },
        ],
      });
    }

    // Create site configuration for footer
    const existingSiteConfig = await db.siteConfig.findFirst();
    if (!existingSiteConfig) {
      await db.siteConfig.createMany({
        data: [
          {
            key: "footer",
            value: JSON.stringify({
              description: "A life-saving blood donation platform dedicated to connecting donors with those in need across Bangladesh.",
              facebook: "https://facebook.com/bloodchai",
              twitter: "https://twitter.com/bloodchai",
              instagram: "https://instagram.com/bloodchai",
              address: "Dhaka, Bangladesh",
              phone: "+880 1234-567890",
              email: "contact@bloodchai.org",
            }),
          },
          {
            key: "contact",
            value: JSON.stringify({
              address: "Dhaka, Bangladesh",
              phone: "+880 1234-567890",
              email: "contact@bloodchai.org",
              emergencyPhone: "+880 1987-654321",
            }),
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      admin: { 
        email: admin.email, 
        password: "admin123",
        name: admin.name 
      },
      note: "Please change the admin password after first login!",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
