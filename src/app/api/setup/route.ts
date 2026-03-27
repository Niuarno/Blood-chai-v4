import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Check environment variables
    const dbUrl = process.env.DATABASE_URL;
    const directDbUrl = process.env.DIRECT_DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json({
        error: "DATABASE_URL is not set",
        help: "Please set DATABASE_URL in your Vercel environment variables"
      }, { status: 500 });
    }

    // Try to run prisma db push using npx
    // This will create the tables if they don't exist
    try {
      const { stdout, stderr } = await execAsync("npx prisma db push --accept-data-loss --skip-generate", {
        timeout: 60000, // 60 second timeout
        env: {
          ...process.env,
          // Ensure we use the direct URL for schema push
          DATABASE_URL: directDbUrl || dbUrl,
        }
      });

      return NextResponse.json({
        success: true,
        message: "Database schema created successfully!",
        output: stdout,
        warning: stderr || undefined,
        next: "Visit /api/seed to create the admin user"
      });
    } catch (execError: any) {
      console.error("Schema push failed:", execError);

      return NextResponse.json({
        error: "Failed to create database schema",
        details: execError.message,
        help: "Please run 'npx prisma db push' locally with your production DATABASE_URL",
        alternative: "You can also use Prisma Migrate in your CI/CD pipeline"
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({
      error: "Setup failed",
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
