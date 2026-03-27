import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      url: process.env.DATABASE_URL ? "Set (hidden)" : "NOT SET",
      directUrl: process.env.DIRECT_DATABASE_URL ? "Set (hidden)" : "NOT SET",
    },
    connection: "unknown",
    tables: {} as Record<string, boolean>,
    errors: [] as string[],
  };

  // Test database connection
  try {
    await db.$queryRaw`SELECT 1`;
    status.connection = "connected";
  } catch (error: any) {
    status.connection = "failed";
    status.errors.push(`Connection failed: ${error.message}`);
    return NextResponse.json(status, { status: 500 });
  }

  // Check if tables exist by trying to count records
  const tables = [
    { name: "User", model: db.user },
    { name: "Donor", model: db.donor },
    { name: "Recipient", model: db.recipient },
    { name: "BloodRequest", model: db.bloodRequest },
    { name: "Donation", model: db.donation },
    { name: "BloodBank", model: db.bloodBank },
    { name: "Report", model: db.report },
    { name: "Notice", model: db.notice },
    { name: "PaymentConfig", model: db.paymentConfig },
    { name: "SiteConfig", model: db.siteConfig },
    { name: "EmergencyCallout", model: db.emergencyCallout },
    { name: "Session", model: db.session },
  ];

  for (const table of tables) {
    try {
      await table.model.count();
      status.tables[table.name] = true;
    } catch (error: any) {
      status.tables[table.name] = false;
      status.errors.push(`Table ${table.name}: ${error.message}`);
    }
  }

  const allTablesExist = Object.values(status.tables).every(v => v === true);

  return NextResponse.json({
    ...status,
    ready: allTablesExist,
    message: allTablesExist
      ? "Database is fully set up and ready!"
      : "Some tables are missing. Visit /api/setup to create them, or run 'npx prisma db push' locally.",
  });
}
