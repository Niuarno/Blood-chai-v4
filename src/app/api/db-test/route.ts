import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const startTime = Date.now();

  try {
    // Test 1: Raw connection test
    let connectionTest;
    try {
      await db.$queryRaw`SELECT 1 as test`;
      connectionTest = "SUCCESS";
    } catch (e: any) {
      connectionTest = `FAILED: ${e.message}`;
      return NextResponse.json({
        status: "error",
        step: "connection",
        error: e.message,
        code: e.code,
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasDirectUrl: !!process.env.DIRECT_DATABASE_URL,
          nodeEnv: process.env.NODE_ENV,
        }
      }, { status: 500 });
    }

    // Test 2: Check if users table exists and is accessible
    let userCount = 0;
    try {
      userCount = await db.user.count();
    } catch (e: any) {
      return NextResponse.json({
        status: "error",
        step: "users_table",
        error: e.message,
        code: e.code,
        connectionTest,
      }, { status: 500 });
    }

    // Test 3: Check for admin user
    let adminUser = null;
    try {
      adminUser = await db.user.findFirst({
        where: { role: "admin" },
        select: { email: true, name: true, role: true }
      });
    } catch (e: any) {
      return NextResponse.json({
        status: "error",
        step: "admin_check",
        error: e.message,
      }, { status: 500 });
    }

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: "ok",
      responseTime: `${responseTime}ms`,
      database: {
        connected: true,
        userCount,
        hasAdmin: !!adminUser,
        admin: adminUser ? { email: adminUser.email, name: adminUser.name } : null,
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_DATABASE_URL,
      },
      nextSteps: adminUser
        ? "Database is ready! Login at /login"
        : "Visit /api/seed to create an admin user",
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
