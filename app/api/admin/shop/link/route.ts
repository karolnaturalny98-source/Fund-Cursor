import { NextResponse } from "next/server";
import { linkShopOrderToUser } from "@/lib/queries/shop";
import { assertAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface LinkRequest {
  transactionId: string;
  userId: string;
}

export async function POST(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 }
    );
  }

  try {
    const body: LinkRequest = await request.json();
    const { transactionId, userId } = body;

    if (!transactionId || !userId) {
      return NextResponse.json(
        { error: "Brak wymaganych pól: transactionId, userId" },
        { status: 400 }
      );
    }

    await linkShopOrderToUser(transactionId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error linking shop order:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas powiązywania zamówienia" },
      { status: 500 }
    );
  }
}
