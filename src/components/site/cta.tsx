import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";

export function Cta({ showPricing = true }: { showPricing?: boolean }) {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card p-12 text-center md:p-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]"
            />
            <h2 className="relative z-10 text-balance text-3xl font-extrabold leading-tight md:text-5xl">
              رقبات منتظر تو نمی‌مانند
            </h2>
            <p className="relative z-10 mx-auto mt-5 max-w-xl text-balance text-muted-foreground">
              همین حالا رایگان ثبت‌نام کن، یا مستقیم برای تیزر تبلیغاتی اختصاصی یا CRM
              اینستاگرام درخواست بده — دیر کردن هزینه دارد.
            </p>
            <div className="relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/login">
                  شروع رایگان
                  <ArrowLeft size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#content-production">درخواست تیزر تبلیغاتی</a>
              </Button>
              {showPricing && (
                <Button size="lg" variant="outline" asChild>
                  <a href="#pricing">مشاهده پلن‌ها</a>
                </Button>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
