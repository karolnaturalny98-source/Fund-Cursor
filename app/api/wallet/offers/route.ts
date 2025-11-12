import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function toNumber(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
}

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    where: {
      plans: {
        some: {},
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      plans: {
        orderBy: {
          price: "asc",
        },
        select: {
          id: true,
          name: true,
          price: true,
          currency: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const payload = companies.map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
    plans: company.plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: toNumber(plan.price),
      currency: plan.currency ?? "USD",
    })),
  }));

  return NextResponse.json({ data: payload });
}
