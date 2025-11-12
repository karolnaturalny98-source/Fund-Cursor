import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { importAffiliateTransaction, findUserIdByEmail } from "@/lib/queries/affiliates";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PurchaseRequest {
  companyId: string;
  planId: string;
  email: string;
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    const body: PurchaseRequest = await request.json();

    const { companyId, planId, email } = body;

    if (!companyId || !planId || !email) {
      return NextResponse.json(
        { error: "Brak wymaganych pól: companyId, planId, email" },
        { status: 400 }
      );
    }

    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Nieprawidłowy format email" },
        { status: 400 }
      );
    }

    // Pobierz plan i firmę
    const plan = await prisma.companyPlan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        name: true,
        price: true,
        currency: true,
        affiliateUrl: true,
        affiliateCommission: true,
        company: {
          select: {
            id: true,
            name: true,
            cashbackRate: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan nie został znaleziony" },
        { status: 404 }
      );
    }

    if (plan.company.id !== companyId) {
      return NextResponse.json(
        { error: "Plan nie należy do wybranej firmy" },
        { status: 400 }
      );
    }

    if (!plan.affiliateUrl) {
      return NextResponse.json(
        { error: "Brak linku afiliacyjnego dla tego planu" },
        { status: 400 }
      );
    }

    // Oblicz cashback
    const cashbackRate = plan.company.cashbackRate ?? 0;
    const price = Number(plan.price);
    const cashbackPoints = Math.round((price * cashbackRate) / 100);

    // Znajdź userId - jeśli zalogowany, użyj jego ID, w przeciwnym razie spróbuj znaleźć po email
    let userId: string | null = null;
    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        select: { id: true },
      });
      userId = dbUser?.id ?? null;
    } else {
      userId = await findUserIdByEmail(email);
    }

    // Generuj unikalny externalId
    const externalId = `SHOP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Utwórz transakcję afiliacyjną PRZED przekierowaniem
    const transaction = await importAffiliateTransaction({
      companyId,
      userId: userId ?? undefined,
      platform: "SHOP",
      source: "SHOP",
      externalId,
      userEmail: email.toLowerCase().trim(),
      amount: new Prisma.Decimal(price),
      currency: plan.currency ?? "USD",
      points: cashbackPoints,
      purchaseAt: new Date(),
      notes: `Plan: ${plan.name} (ID: ${planId})`,
    });

    // Przygotuj affiliateUrl z planu + parametry trackingowe
    const url = new URL(plan.affiliateUrl);
    url.searchParams.set("ref", "fundedrank");
    url.searchParams.set("transaction", transaction.id);
    const affiliateUrl = url.toString();

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      affiliateUrl,
    });
  } catch (error) {
    console.error("Error creating shop purchase:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia zamówienia" },
      { status: 500 }
    );
  }
}
