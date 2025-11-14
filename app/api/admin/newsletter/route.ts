import { NextRequest, NextResponse } from "next/server";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await assertAdminRequest();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const skip = (page - 1) * limit;

    // Budowanie warunku where
    const where: {
      status?: string;
      email?: { contains: string; mode: "insensitive" };
    } = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.email = { contains: search, mode: "insensitive" };
    }

    // Pobieranie subskrybentów i liczby całkowitej
    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    // Statystyki
    const stats = await prisma.newsletterSubscriber.groupBy({
      by: ["status"],
      _count: true,
    });

    const statsMap = stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        active: statsMap.active || 0,
        unsubscribed: statsMap.unsubscribed || 0,
        total,
      },
    });
  } catch (error) {
    console.error("Newsletter admin GET error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
