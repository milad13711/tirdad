import { ArrowLeft } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { blogPosts } from "@/lib/content";

export function Blog() {
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
          {blogPosts.map((post, index) => (
            <Reveal key={post.title} delay={index * 0.1}>
              <article className="group h-full cursor-pointer rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/40">
                <span className="mb-5 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {post.category}
                </span>
                <h3 className="mb-3 text-lg font-bold leading-8">{post.title}</h3>
                <p className="mb-6 leading-7 text-muted-foreground">{post.excerpt}</p>
                <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="text-muted-foreground">{post.readTime} مطالعه</span>
                  <span className="flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    ادامه مطلب <ArrowLeft size={14} />
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
