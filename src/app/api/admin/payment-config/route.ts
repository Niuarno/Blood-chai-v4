import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const configs = await db.paymentConfig.findMany({
      orderBy: { method: "asc" },
    });

    return NextResponse.json({ configs });
  } catch (error) {
    console.error("Failed to fetch payment configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment configs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { method, accountName, accountNumber, instructions } = body;

    const config = await db.paymentConfig.create({
      data: {
        method,
        accountName,
        accountNumber,
        instructions,
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Failed to create payment config:", error);
    return NextResponse.json(
      { error: "Failed to create payment config" },
      { status: 500 }
    );
  }
}
