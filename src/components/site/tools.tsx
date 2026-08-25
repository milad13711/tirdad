import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { PublicToolCard } from "@/components/site/public-tool-card";
import { getLandingTools } from "@/lib/queries/tools-public";

export async function Tools() {
  const toolPackages = await getLandingTools(3);
  if (toolPackages.length === 0) return null;

  return (
    <section id="tools" className="py-24 md:py-32">
      <Container className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <Reveal>
          <SectionLabel>۴. سریع‌تر بساز</SectionLabel>
          <SectionTitle>
            ابزارهای آماده برای
            <br /> تولید محتوای حرفه‌ای
          </SectionTitle>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            پکیج‌های آماده‌ای که مستقیم روی سیستم خودت دانلود می‌کنی و همون لحظه استفاده می‌کنی:
            فونت‌های ترند برای طراحی پست و استوری، افکت‌ها و پریست‌های آماده کپ‌کات، و ابزارهای
            مشابه. بعضی‌هاشون کاملاً رایگانن، بعضی‌ها هم پولی.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <Button variant="outline" asChild>
            <Link href="/tools">
              مشاهده همه ابزارها
              <ArrowLeft size={16} />
            </Link>
          </Button>
        </Reveal>
      </Container>

      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {toolPackages.map((toolPackage, index) => (
            <Reveal key={toolPackage.id} delay={index * 0.1}>
              <PublicToolCard toolPackage={toolPackage} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
