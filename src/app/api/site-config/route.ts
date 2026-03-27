import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Fetch site configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      const config = await db.siteConfig.findUnique({
        where: { key },
      });
      
      if (!config) {
        return NextResponse.json({ config: null });
      }
      
      return NextResponse.json({ config: JSON.parse(config.value) });
    }

    const configs = await db.siteConfig.findMany();
    const result: Record<string, any> = {};
    
    for (const config of configs) {
      result[config.key] = JSON.parse(config.value);
    }

    return NextResponse.json({ configs: result });
  } catch (error) {
    console.error("Failed to fetch site config:", error);
    return NextResponse.json(
      { error: "Failed to fetch site config" },
      { status: 500 }
    );
  }
}

// POST - Update site configuration (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    const config = await db.siteConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Failed to update site config:", error);
    return NextResponse.json(
      { error: "Failed to update site config" },
      { status: 500 }
    );
  }
}
