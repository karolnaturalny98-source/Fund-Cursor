import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminRequest } from "@/lib/auth";
import { getBlogCategories } from "@/lib/queries/blog";
import { generateSlug } from "@/lib/utils/blog";

const createCategorySchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  order: z.number().int().default(0),
});

export async function GET() {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const categories = await getBlogCategories();
  return NextResponse.json({ data: categories });
}

export async function POST(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(json);

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
  const slug = data.slug || generateSlug(data.name);

  // Sprawdź unikalność slug
  const existing = await prisma.blogCategory.findUnique({
    where: { slug },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Slug już istnieje. Wybierz inny." },
      { status: 409 },
    );
  }

  try {
    const category = await prisma.blogCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        order: data.order,
      },
    });

    try {
      revalidatePath("/admin");
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
    }, { status: 201 });
  } catch (error) {
    console.error("[admin/blog/categories] create error", error);
    return NextResponse.json(
      { error: "Nie udało się utworzyć kategorii." },
      { status: 500 },
    );
  }
}

