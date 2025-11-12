import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  question: z.string().min(3).optional(),
  answer: z.string().min(3).optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  await assertAdminRequest();

  const { slug, id } = await params;

  if (!slug || !id) {
    return NextResponse.json({ error: "Missing identifiers" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse({
    question: body?.question,
    answer: body?.answer,
    order: typeof body?.order === "number" ? body.order : body?.order ? Number(body.order) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const faq = await prisma.faqItem.findFirst({
    where: {
      id,
      company: {
        slug,
      },
    },
    select: { id: true },
  });

  if (!faq) {
    return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  }

  await prisma.faqItem.update({
    where: { id },
    data: {
      ...(parsed.data.question !== undefined
        ? { question: parsed.data.question.trim() }
        : {}),
      ...(parsed.data.answer !== undefined
        ? { answer: parsed.data.answer.trim() }
        : {}),
      ...(parsed.data.order !== undefined ? { order: parsed.data.order } : {}),
    },
  });

  return NextResponse.json({ status: "updated" });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  await assertAdminRequest();

  const { slug, id } = await params;

  if (!slug || !id) {
    return NextResponse.json({ error: "Missing identifiers" }, { status: 400 });
  }

  const faq = await prisma.faqItem.findFirst({
    where: {
      id,
      company: {
        slug,
      },
    },
    select: { id: true },
  });

  if (!faq) {
    return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  }

  await prisma.faqItem.delete({ where: { id } });
  return NextResponse.json({ status: "deleted" });
}
