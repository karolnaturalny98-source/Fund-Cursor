import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdminRequest } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/blog";

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  order: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = updateCategorySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Błąd walidacji.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const existing = await prisma.blogCategory.findUnique({
    where: { id },
    select: { slug: true, name: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const updateData: Prisma.BlogCategoryUpdateInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
    // Auto-generuj slug jeśli zmieniono nazwę i nie podano slug
    if (!data.slug) {
      updateData.slug = generateSlug(data.name);
    }
  }
  if (data.slug !== undefined) {
    // Sprawdź unikalność slug jeśli się zmienia
    if (data.slug !== existing.slug) {
      const slugExists = await prisma.blogCategory.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Slug już istnieje. Wybierz inny." },
          { status: 409 },
        );
      }
    }
    updateData.slug = data.slug;
  }
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.order !== undefined) updateData.order = data.order;

  try {
    const category = await prisma.blogCategory.update({
      where: { id },
      data: updateData,
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/baza-wiedzy");
    } catch (revalidateError) {
      console.warn("[admin/blog/categories] revalidate failed", revalidateError);
    }

    return NextResponse.json({
      data: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        order: category.order,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug już istnieje." },
        { status: 409 },
      );
    }

    console.error("[admin/blog/categories] update error", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować kategorii." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { id } = await params;

  try {
    await prisma.blogCategory.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/baza-wiedzy");
    } catch (revalidateError) {
      console.warn("[admin/blog/categories] revalidate failed", revalidateError);
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono kategorii." },
        { status: 404 },
      );
    }

    console.error("Delete blog category error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć kategorii." },
      { status: 500 },
    );
  }
}

