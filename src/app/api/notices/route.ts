import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Fetch notices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetAudience = searchParams.get("targetAudience");
    const limit = searchParams.get("limit");

    const where: any = { isActive: true };

    if (targetAudience && targetAudience !== "all") {
      where.OR = [
        { targetAudience: "all" },
        { targetAudience: targetAudience },
      ];
    }

    const notices = await db.notice.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({ notices });
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return NextResponse.json(
      { error: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}

// POST - Create notice (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, type, targetAudience, isPinned, expiresAt } = body;

    const notice = await db.notice.create({
      data: {
        title,
        content,
        type: type || "general",
        targetAudience: targetAudience || "all",
        isPinned: isPinned || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ notice });
  } catch (error) {
    console.error("Failed to create notice:", error);
    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 }
    );
  }
}
