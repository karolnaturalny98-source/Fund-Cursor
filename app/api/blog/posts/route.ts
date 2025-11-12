import { NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/queries/blog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId");
  const searchQuery = url.searchParams.get("search");
  const cursor = url.searchParams.get("cursor");
  const take = url.searchParams.get("take");

  const result = await getBlogPosts({
    status: "PUBLISHED", // Tylko opublikowane
    categoryId: categoryId || undefined,
    searchQuery: searchQuery || undefined,
    cursor: cursor || undefined,
    take: take ? Number.parseInt(take, 10) : undefined,
  });

  return NextResponse.json({ data: result.items, nextCursor: result.nextCursor });
}

