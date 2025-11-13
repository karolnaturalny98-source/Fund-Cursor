import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { BlogCategory, BlogPostWithRelations, BlogPostStatus } from "@/lib/types";

const prismaConfigured = Boolean(process.env.DATABASE_URL);

function shouldReturnFallback(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  );
}

export interface BlogPostParams {
  status?: BlogPostStatus | "ALL";
  categoryId?: string;
  searchQuery?: string;
  cursor?: string;
  take?: number;
}

export interface BlogPostResponse {
  items: BlogPostWithRelations[];
  nextCursor: string | null;
}

export async function getBlogPosts(
  params: BlogPostParams = {},
): Promise<BlogPostResponse> {
  if (!prismaConfigured) {
    return { items: [], nextCursor: null };
  }

  const {
    status = "ALL",
    categoryId,
    searchQuery,
    cursor,
    take = 20,
  } = params;

  const limit = Math.max(1, Math.min(take, 100));
  const where: Prisma.BlogPostWhereInput = {};

  // Filter by status
  if (status !== "ALL") {
    where.status = status;
  }

  // Filter by category
  if (categoryId) {
    where.categories = {
      some: {
        categoryId,
      },
    };
  }

  // Search filter
  if (searchQuery) {
    const search = searchQuery.trim();
    if (search.length > 0) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
  }

  try {
    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : undefined,
      take: limit + 1,
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return {
      items: items.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        featuredImageUrl: post.featuredImageUrl,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        ogImageUrl: post.ogImageUrl,
        status: post.status as BlogPostStatus,
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
          displayName: post.author.displayName ?? null,
          email: post.author.email ?? null,
        },
        categories: post.categories.map((pc) => ({
          id: pc.category.id,
          slug: pc.category.slug,
          name: pc.category.name,
          description: pc.category.description,
          order: pc.category.order,
          createdAt: pc.category.createdAt.toISOString(),
          updatedAt: pc.category.updatedAt.toISOString(),
        })),
      })),
      nextCursor,
    };
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[blog] prisma unavailable, returning fallback blog posts");
      return { items: [], nextCursor: null };
    }
    throw error;
  }
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPostWithRelations | null> {
  if (!prismaConfigured) {
    return null;
  }

  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
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
      return null;
    }

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      featuredImageUrl: post.featuredImageUrl,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      ogImageUrl: post.ogImageUrl,
      status: post.status as BlogPostStatus,
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
        displayName: post.author.displayName ?? null,
        email: post.author.email ?? null,
      },
      categories: post.categories.map((pc) => ({
        id: pc.category.id,
        slug: pc.category.slug,
        name: pc.category.name,
        description: pc.category.description,
        order: pc.category.order,
        createdAt: pc.category.createdAt.toISOString(),
        updatedAt: pc.category.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[blog] prisma unavailable, returning null for blog post");
      return null;
    }
    throw error;
  }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  if (!prismaConfigured) {
    return [];
  }

  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { order: "asc" },
    });

    return categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      order: cat.order,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }));
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[blog] prisma unavailable, returning fallback categories");
      return [];
    }
    throw error;
  }
}

export async function getPublishedBlogPosts(
  limit = 10,
): Promise<BlogPostWithRelations[]> {
  if (!prismaConfigured) {
    return [];
  }

  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: {
          not: null,
        },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
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

    return posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      featuredImageUrl: post.featuredImageUrl,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      ogImageUrl: post.ogImageUrl,
      status: post.status as BlogPostStatus,
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
        displayName: post.author.displayName ?? null,
        email: post.author.email ?? null,
      },
      categories: post.categories.map((pc) => ({
        id: pc.category.id,
        slug: pc.category.slug,
        name: pc.category.name,
        description: pc.category.description,
        order: pc.category.order,
        createdAt: pc.category.createdAt.toISOString(),
        updatedAt: pc.category.updatedAt.toISOString(),
      })),
    }));
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[blog] prisma unavailable, returning fallback published posts");
      return [];
    }
    throw error;
  }
}

export async function getRelatedPosts(
  postId: string,
  limit = 3,
): Promise<BlogPostWithRelations[]> {
  if (!prismaConfigured) {
    return [];
  }

  try {
    const currentPost = await prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        categories: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    if (!currentPost) {
      return [];
    }

    const categoryIds = currentPost.categories.map((pc) => pc.categoryId);

    const related = await prisma.blogPost.findMany({
      where: {
        id: { not: postId },
        status: "PUBLISHED",
        publishedAt: { not: null },
        OR: categoryIds.length > 0
          ? [
              {
                categories: {
                  some: {
                    categoryId: { in: categoryIds },
                  },
                },
              },
            ]
          : [],
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
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

    return related.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      featuredImageUrl: post.featuredImageUrl,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      ogImageUrl: post.ogImageUrl,
      status: post.status as BlogPostStatus,
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
        displayName: post.author.displayName ?? null,
        email: post.author.email ?? null,
      },
      categories: post.categories.map((pc) => ({
        id: pc.category.id,
        slug: pc.category.slug,
        name: pc.category.name,
        description: pc.category.description,
        order: pc.category.order,
        createdAt: pc.category.createdAt.toISOString(),
        updatedAt: pc.category.updatedAt.toISOString(),
      })),
    }));
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[blog] prisma unavailable, returning fallback related posts");
      return [];
    }
    throw error;
  }
}

