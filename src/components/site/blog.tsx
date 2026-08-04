import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import type { BlogPost } from "@/generated/prisma/client";

function estimateReadTime(content: string | null) {
  const words = (content ?? "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 150))} دقیقه`;
}

export function Blog({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="py-24 md:py-32">
      <Container>
        <Reveal className="mb-16">
          <SectionLabel>بلاگ</SectionLabel>
          <SectionTitle>
            آموزش‌ها و مقالات
            <br /> تخصصی
          </SectionTitle>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal key={post.id} delay={index * 0.1}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="h-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/40">
                  {post.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="-mx-7 -mt-7 mb-5 h-40 w-[calc(100%+3.5rem)] object-cover"
                    />
                  )}
                  <h3 className="mb-3 text-lg font-bold leading-8">{post.title}</h3>
                  {post.excerpt && (
                    <p className="mb-6 leading-7 text-muted-foreground">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                    <span className="text-muted-foreground">
                      {estimateReadTime(post.content)} مطالعه
                    </span>
                    <span className="flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      ادامه مطلب <ArrowLeft size={14} />
                    </span>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
