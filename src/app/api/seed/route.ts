import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Check if admin already exists - this also tests if tables exist
    let existingAdmin;
    try {
      existingAdmin = await db.user.findFirst({
        where: { role: "admin" },
      });
    } catch (findError: any) {
      // If tables don't exist, return helpful error
      if (findError.message?.includes("does not exist") || findError.code === "P2021") {
        return NextResponse.json({
          error: "Database tables not found",
          help: "The database schema was not created. This should happen automatically during build.",
          solution: "Try one of these fixes:",
          options: [
            "1. Redeploy on Vercel (the build script should create tables)",
            "2. Run 'npx prisma db push' locally with your production DATABASE_URL",
            "3. Check that DATABASE_URL is correctly set in Vercel environment variables"
          ],
          details: String(findError.message || findError),
        }, { status: 500 });
      }
      throw findError;
    }

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Database is ready! Admin user exists.",
        admin: { email: existingAdmin.email, name: existingAdmin.name },
        login: {
          email: "admin@bloodchai.org",
          password: "admin123",
          url: "/login"
        },
        note: "Go to /login and use the credentials above to sign in."
      });
    }

    // Create admin user
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
    try {
      const existingPayments = await db.paymentConfig.findFirst();
      if (!existingPayments) {
        await db.paymentConfig.createMany({
          data: [
            {
              method: "bkash",
              accountName: "BloodChai Foundation",
              accountNumber: "01712345678",
              instructions: `1. Open your bKash app
2. Select 'Send Money'
3. Enter the number: 01712345678
4. Enter the amount
5. Add reference: 'Donation'
6. Confirm with your PIN`,
            },
            {
              method: "nagad",
              accountName: "BloodChai Foundation",
              accountNumber: "01812345678",
              instructions: `1. Open your Nagad app
2. Select 'Send Money'
3. Enter the number: 01812345678
4. Enter the amount
5. Add reference: 'Donation'
6. Confirm with your PIN`,
            },
            {
              method: "bank",
              accountName: "BloodChai Foundation",
              accountNumber: "1234567890",
              instructions: `Bank Name: Dutch Bangla Bank
Branch: Dhanmondi, Dhaka
Account Type: Savings

For international transfers:
SWIFT Code: DBBLBDDH
Routing Number: 123456789`,
            },
          ],
        });
      }
    } catch (e) {
      console.log("Payment config creation skipped");
    }

    // Create site configuration
    try {
      const existingConfig = await db.siteConfig.findFirst();
      if (!existingConfig) {
        await db.siteConfig.createMany({
          data: [
            {
              key: "footer",
              value: JSON.stringify({
                description: "A life-saving blood donation platform connecting donors with those in need across Bangladesh.",
                facebook: "https://facebook.com/bloodchai",
                twitter: "https://twitter.com/bloodchai",
                instagram: "https://instagram.com/bloodchai",
                address: "Dhaka, Bangladesh",
                phone: "+880 1234-567890",
                email: "contact@bloodchai.org",
              }),
            },
          ],
        });
      }
    } catch (e) {
      console.log("Site config creation skipped");
    }

    // Create sample blood banks
    try {
      const existingBanks = await db.bloodBank.findFirst();
      if (!existingBanks) {
        await db.bloodBank.createMany({
          data: [
            {
              name: "Bangladesh Red Crescent Society Blood Center",
              division: "Dhaka",
              district: "Dhaka",
              address: "Bara Maghbazar, Dhaka-1217",
              phone: "+880 2-9341234",
              email: "info@redcrescent.org",
              operatingHours: "Sat-Thu: 9AM-5PM, Fri: Closed",
              services: JSON.stringify(["Whole Blood", "Platelets", "Plasma"]),
              mapUrl: "https://maps.google.com/?q=Red+Crescent+Dhaka",
            },
            {
              name: "Dhaka Medical College Blood Bank",
              division: "Dhaka",
              district: "Dhaka",
              address: "Shahbag, Dhaka-1000",
              phone: "+880 2-9661051",
              operatingHours: "24/7 Emergency Service",
              services: JSON.stringify(["Whole Blood", "Platelets", "Emergency Blood"]),
              mapUrl: "https://maps.google.com/?q=Dhaka+Medical+College",
            },
          ],
        });
      }
    } catch (e) {
      console.log("Blood bank creation skipped");
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully! 🎉",
      admin: {
        email: admin.email,
        password: "admin123",
        name: admin.name,
      },
      loginUrl: "/login",
      important: "Please change the admin password after first login!",
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        error: "Failed to seed database",
        details: error?.message || String(error),
        code: error?.code,
        help: "Make sure DATABASE_URL is correctly set and tables exist.",
      },
      { status: 500 }
    );
  }
}
