import { prisma } from "@/lib/prisma";

interface EnsureUserParams {
  clerkId: string;
  email?: string | null;
  displayName?: string | null;
}

export async function ensureUserRecord({
  clerkId,
  email,
  displayName,
}: EnsureUserParams) {
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {
      ...(email !== undefined ? { email: email ?? null } : {}),
      ...(displayName !== undefined ? { displayName: displayName ?? null } : {}),
    },
    create: {
      clerkId,
      email: email ?? null,
      displayName: displayName ?? null,
    },
  });

  // Automatyczne powiązanie zamówień ze sklepu, jeśli email został zaktualizowany
  if (email) {
    const normalizedEmail = email.toLowerCase().trim();
    await prisma.affiliateTransaction.updateMany({
      where: {
        source: "SHOP",
        userEmail: normalizedEmail,
        userId: null,
      },
      data: {
        userId: user.id,
      },
    });
  }

  return user;
}
