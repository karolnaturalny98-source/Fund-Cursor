import { NextResponse } from "next/server";
import { getBlogPostBySlug } from "@/lib/queries/blog";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Tylko opublikowane artykuły
  if (post.status !== "PUBLISHED") {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Zwiększ licznik wyświetleń
  try {
    await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.warn("[blog] Failed to increment views", error);
  }

  return NextResponse.json({ data: post });
}

