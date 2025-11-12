import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdminRequest } from "@/lib/auth";
import { getBlogPostBySlug } from "@/lib/queries/blog";
import { calculateReadingTime } from "@/lib/utils/blog";

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  featuredImageUrl: z.string().url().optional().or(z.literal("")),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  categoryIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { id } = await params;

  try {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            clerkId: true,
            displayName: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        featuredImageUrl: post.featuredImageUrl,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        ogImageUrl: post.ogImageUrl,
        status: post.status,
        authorId: post.authorId,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        views: post.views,
        readingTime: post.readingTime,
        tags: post.tags ?? [],
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: {
          id: post.author.id,
          clerkId: post.author.clerkId,
          displayName: post.author.displayName,
          email: post.author.email,
        },
        categories: post.categories.map((pc) => ({
          id: pc.category.id,
          slug: pc.category.slug,
          name: pc.category.name,
        })),
      },
    });
  } catch (error) {
    console.error("[admin/blog] get error", error);
    return NextResponse.json({ error: "GET_FAILED" }, { status: 500 });
  }
}

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
  const parsed = updatePostSchema.safeParse(json);

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

  // Sprawdź czy post istnieje
  const existingPost = await prisma.blogPost.findUnique({
    where: { id },
    select: { slug: true, status: true },
  });

  if (!existingPost) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Sprawdź unikalność slug jeśli się zmienia
  if (data.slug && data.slug !== existingPost.slug) {
    const slugExists = await prisma.blogPost.findUnique({
      where: { slug: data.slug },
    });

    if (slugExists) {
      return NextResponse.json(
        { error: "Slug już istnieje. Wybierz inny." },
        { status: 409 },
      );
    }
  }

  const updateData: Prisma.BlogPostUpdateInput = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.content !== undefined) {
    updateData.content = data.content;
    updateData.readingTime = calculateReadingTime(data.content);
  }
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt || null;
  if (data.featuredImageUrl !== undefined) updateData.featuredImageUrl = data.featuredImageUrl || null;
  if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle || null;
  if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription || null;
  if (data.ogImageUrl !== undefined) updateData.ogImageUrl = data.ogImageUrl || null;
  if (data.tags !== undefined) updateData.tags = data.tags;
  
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === "PUBLISHED" && existingPost.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    }
  }

  // Aktualizacja kategorii
  if (data.categoryIds !== undefined) {
    // Usuń wszystkie istniejące powiązania
    await prisma.blogPostCategory.deleteMany({
      where: { postId: id },
    });

    // Dodaj nowe powiązania
    if (data.categoryIds.length > 0) {
      updateData.categories = {
        create: data.categoryIds.map((categoryId) => ({
          categoryId,
        })),
      };
    }
  }

  try {
    await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/baza-wiedzy");
      if (data.slug) {
        revalidatePath(`/baza-wiedzy/${data.slug}`);
      }
    } catch (revalidateError) {
      console.warn("[admin/blog] revalidate failed", revalidateError);
    }

    const updatedPost = await getBlogPostBySlug(
      (data.slug || existingPost.slug) as string,
    );

    return NextResponse.json({ data: updatedPost });
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

    console.error("[admin/blog] update error", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować artykułu." },
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
    await prisma.blogPost.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/baza-wiedzy");
    } catch (revalidateError) {
      console.warn("[admin/blog] revalidate failed", revalidateError);
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono artykułu." },
        { status: 404 },
      );
    }

    console.error("Delete blog post error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć artykułu." },
      { status: 500 },
    );
  }
}

