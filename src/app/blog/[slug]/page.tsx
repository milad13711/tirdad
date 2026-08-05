import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Footer } from "@/components/site/footer";
import { Container } from "@/components/site/container";
import { getPublishedBlogPostBySlug } from "@/lib/queries/blog";
import { getSiteSettings } from "@/lib/queries/settings";
import { formatJalali } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return {};

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getPublishedBlogPostBySlug(slug),
    getSiteSettings(),
  ]);
  if (!post) notFound();

  return (
    <>
      <Navbar showPricing={settings.subscriptionPlansEnabled} />
      <main className="flex-1 py-24 md:py-32">
        <Container className="max-w-3xl">
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="mb-8 aspect-video w-full rounded-2xl object-cover"
            />
          )}
          <h1 className="mb-3 text-balance text-3xl font-extrabold leading-tight md:text-4xl">
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="mb-8 text-sm text-muted-foreground">{formatJalali(post.publishedAt)}</p>
          )}
          <div className="whitespace-pre-line leading-8 text-foreground">{post.content}</div>
        </Container>
      </main>
      <Footer />
      <MobileBottomNav showPricing={settings.subscriptionPlansEnabled} />
    </>
  );
}
