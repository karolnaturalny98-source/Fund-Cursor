import { prisma } from "@/lib/prisma";

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  postsLast30Days: number;
  totalViews: number;
  averageViewsPerPost: number;
  totalCategories: number;
}

export interface BlogTimeSeriesPoint {
  date: string;
  created: number;
  published: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TopBlogCategory {
  categoryName: string;
  categorySlug: string;
  postsCount: number;
}

export interface TopBlogAuthor {
  authorName: string;
  authorEmail: string | null;
  postsCount: number;
}

export async function getBlogStats(): Promise<BlogStats> {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    postsLast30Days,
    allPostsWithViews,
    totalCategories,
  ] = await Promise.all([
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.count({ where: { status: "DRAFT" } }),
    prisma.blogPost.count({ where: { status: "ARCHIVED" } }),
    prisma.blogPost.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.blogPost.findMany({
      select: {
        views: true,
      },
    }),
    prisma.blogCategory.count(),
  ]);

  // Oblicz łączną liczbę wyświetleń i średnią
  let totalViews = 0;
  if (allPostsWithViews.length > 0) {
    totalViews = allPostsWithViews.reduce((sum, post) => sum + post.views, 0);
  }

  const averageViewsPerPost = totalPosts > 0 ? totalViews / totalPosts : 0;

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    postsLast30Days,
    totalViews,
    averageViewsPerPost,
    totalCategories,
  };
}

export async function getBlogTimeSeries(days = 30): Promise<BlogTimeSeriesPoint[]> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  startDate.setHours(0, 0, 0, 0);

  const [createdPosts, publishedPosts] = await Promise.all([
    prisma.blogPost.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: startDate, not: null },
      },
      select: { publishedAt: true },
      orderBy: { publishedAt: "asc" },
    }),
  ]);

  const dailyMap = new Map<string, { created: number; published: number }>();

  createdPosts.forEach((item) => {
    const date = new Date(item.createdAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { created: 0, published: 0 };
    dailyMap.set(date, { ...existing, created: existing.created + 1 });
  });

  publishedPosts.forEach((item) => {
    if (item.publishedAt) {
      const date = new Date(item.publishedAt).toISOString().split("T")[0];
      const existing = dailyMap.get(date) || { created: 0, published: 0 };
      dailyMap.set(date, { ...existing, published: existing.published + 1 });
    }
  });

  const result: BlogTimeSeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const data = dailyMap.get(dateStr) || { created: 0, published: 0 };
    result.push({
      date: dateStr,
      created: data.created,
      published: data.published,
    });
  }

  return result;
}

export async function getBlogStatusDistribution(): Promise<StatusDistribution[]> {
  const counts = await prisma.blogPost.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const total = counts.reduce((sum, item) => sum + item._count.id, 0);

  return counts.map((item) => ({
    status: item.status,
    count: item._count.id,
    percentage: total > 0 ? (item._count.id / total) * 100 : 0,
  }));
}

export async function getTopBlogCategories(limit = 5): Promise<TopBlogCategory[]> {
  const posts = await prisma.blogPost.findMany({
    include: {
      categories: {
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  const grouped = new Map<string, { count: number; name: string; slug: string }>();
  posts.forEach((post) => {
    post.categories.forEach((pc) => {
      const key = pc.categoryId;
      const existing = grouped.get(key) || {
        count: 0,
        name: pc.category.name,
        slug: pc.category.slug,
      };
      grouped.set(key, { ...existing, count: existing.count + 1 });
    });
  });

  const sorted = Array.from(grouped.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return sorted.map((item) => ({
    categoryName: item.name,
    categorySlug: item.slug,
    postsCount: item.count,
  }));
}

export async function getTopBlogAuthors(limit = 5): Promise<TopBlogAuthor[]> {
  const posts = await prisma.blogPost.findMany({
    include: {
      author: {
        select: {
          displayName: true,
          email: true,
        },
      },
    },
  });

  const grouped = new Map<string, { count: number; name: string; email: string | null }>();
  posts.forEach((post) => {
    const key = post.authorId;
    const existing = grouped.get(key) || {
      count: 0,
      name: post.author.displayName || "Unknown",
      email: post.author.email,
    };
    grouped.set(key, { ...existing, count: existing.count + 1 });
  });

  const sorted = Array.from(grouped.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return sorted.map((item) => ({
    authorName: item.name,
    authorEmail: item.email,
    postsCount: item.count,
  }));
}

