import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Brak parametru email" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
      },
      take: 10,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas wyszukiwania użytkowników" },
      { status: 500 }
    );
  }
}
