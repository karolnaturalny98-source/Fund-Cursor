import { BlogDashboard } from "@/components/admin/blog-dashboard";
import { getBlogPosts, getBlogCategories } from "@/lib/queries/blog";
import {
  getBlogStats,
  getBlogTimeSeries,
  getBlogStatusDistribution,
  getTopBlogCategories,
  getTopBlogAuthors,
} from "@/lib/queries/blog-stats";

export default async function AdminBlogPage() {
  const [
    postsData,
    categories,
    blogStats,
    blogTimeSeries,
    blogStatusDistribution,
    topCategories,
    topAuthors,
  ] = await Promise.all([
    getBlogPosts({ status: "ALL", take: 100 }),
    getBlogCategories(),
    getBlogStats(),
    getBlogTimeSeries(30),
    getBlogStatusDistribution(),
    getTopBlogCategories(5),
    getTopBlogAuthors(5),
  ]);

  return (
    <BlogDashboard
      stats={blogStats}
      timeSeries={blogTimeSeries}
      statusDistribution={blogStatusDistribution}
      topCategories={topCategories}
      topAuthors={topAuthors}
      initialPosts={postsData.items}
      categories={categories}
    />
  );
}
