import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const faqSchema = z.object({
  question: z.string().min(3),
  answer: z.string().min(3),
  order: z.number().int().min(0).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  await assertAdminRequest();

  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Missing company slug" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = faqSchema.safeParse({
    question: body?.question,
    answer: body?.answer,
    order: typeof body?.order === "number" ? body.order : body?.order ? Number(body.order) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  await prisma.faqItem.create({
    data: {
      companyId: company.id,
      question: parsed.data.question.trim(),
      answer: parsed.data.answer.trim(),
      order: parsed.data.order ?? 0,
    },
  });

  return NextResponse.json({ status: "created" }, { status: 201 });
}
