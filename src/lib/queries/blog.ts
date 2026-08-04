import "server-only";
import { prisma } from "@/lib/db";

export async function getPublishedBlogPosts(limit = 3) {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getPublishedBlogPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
}
