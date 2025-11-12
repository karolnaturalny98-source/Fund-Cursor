import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const confirmSchema = z.object({
  transactionId: z.string(),
  userConfirmed: z.boolean(),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = confirmSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { transactionId, userConfirmed } = parsed.data;

    // Znajdź transakcję
    const transaction = await prisma.affiliateTransaction.findUnique({
      where: { id: transactionId, source: "SHOP" },
      select: {
        id: true,
        userId: true,
        userEmail: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transakcja nie została znaleziona" },
        { status: 404 }
      );
    }

    const localUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    const primaryEmail =
      user.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;

    const ownsById =
      transaction.userId !== null &&
      localUser?.id !== undefined &&
      transaction.userId === localUser.id;
    const ownsByEmail =
      transaction.userEmail !== null &&
      primaryEmail !== null &&
      transaction.userEmail.toLowerCase() === primaryEmail;

    if (!ownsById && !ownsByEmail) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // Aktualizuj userConfirmed
    await prisma.affiliateTransaction.update({
      where: { id: transactionId },
      data: { userConfirmed },
    });

    revalidatePath("/admin/cashback");
    revalidatePath("/admin/shop");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to confirm shop purchase:", error);
    return NextResponse.json(
      { error: "Failed to save confirmation" },
      { status: 500 }
    );
  }
}

