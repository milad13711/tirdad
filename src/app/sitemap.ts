import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/queries/blog";

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// Regenerated per-request rather than at build time, since blog posts get
// published from the admin panel between deploys. Courses don't get their
// own entries — there's no individual course detail route, just the /courses
// catalog listed below (fragment URLs aren't real distinct pages to Google).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = baseUrl();
  const posts = await getPublishedBlogPosts(1000);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url, changeFrequency: "daily", priority: 1 },
    { url: `${url}/courses`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${url}/prompts`, changeFrequency: "daily", priority: 0.8 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${url}/blog/${post.slug}`,
    lastModified: post.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
