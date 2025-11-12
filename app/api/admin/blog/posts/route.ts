import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { assertAdminRequest } from "@/lib/auth";
import { ensureUserRecord } from "@/lib/services/user";
import { getBlogPosts } from "@/lib/queries/blog";
import { generateSlug, calculateReadingTime } from "@/lib/utils/blog";

const createPostSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany").max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  content: z.string().min(1, "Treść jest wymagana"),
  excerpt: z.string().max(500).optional(),
  featuredImageUrl: z.string().url().optional().or(z.literal("")),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  categoryIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED" | "ALL" | null;
  const categoryId = url.searchParams.get("categoryId");
  const searchQuery = url.searchParams.get("search");
  const cursor = url.searchParams.get("cursor");
  const take = url.searchParams.get("take");

  const result = await getBlogPosts({
    status: status || "ALL",
    categoryId: categoryId || undefined,
    searchQuery: searchQuery || undefined,
    cursor: cursor || undefined,
    take: take ? Number.parseInt(take, 10) : undefined,
  });

  return NextResponse.json({ data: result.items, nextCursor: result.nextCursor });
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

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createPostSchema.safeParse(json);

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
  const userRecord = await ensureUserRecord({
    clerkId: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    displayName: user.fullName ?? null,
  });

  // Sprawdź czy slug jest unikalny
  const existingPost = await prisma.blogPost.findUnique({
    where: { slug: data.slug },
  });

  if (existingPost) {
    return NextResponse.json(
      { error: "Slug już istnieje. Wybierz inny." },
      { status: 409 },
    );
  }

  const readingTime = calculateReadingTime(data.content);

  try {
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        featuredImageUrl: data.featuredImageUrl || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        ogImageUrl: data.ogImageUrl || null,
        status: data.status,
        authorId: userRecord.id,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        readingTime,
        tags: data.tags || [],
        categories: data.categoryIds && data.categoryIds.length > 0
          ? {
              create: data.categoryIds.map((categoryId) => ({
                categoryId,
              })),
            }
          : undefined,
      },
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

    try {
      revalidatePath("/admin");
      revalidatePath("/baza-wiedzy");
    } catch (revalidateError) {
      console.warn("[admin/blog] revalidate failed", revalidateError);
    }

    return NextResponse.json({
      data: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        status: post.status,
        author: {
          id: post.author.id,
          clerkId: post.author.clerkId,
          displayName: post.author.displayName,
          email: post.author.email,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[admin/blog] create error", error);
    return NextResponse.json(
      { error: "Nie udało się utworzyć artykułu." },
      { status: 500 },
    );
  }
}

