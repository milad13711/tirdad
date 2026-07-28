import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { faqs } from "@/lib/content";

export function Faq() {
  return (
    <section className="py-24 md:py-32">
      <Container className="max-w-3xl">
        <Reveal className="mb-12 text-center">
          <div className="flex flex-col items-center">
            <SectionLabel>سوالات متداول</SectionLabel>
            <SectionTitle>پاسخ سوالات رایج شما</SectionTitle>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </section>
  );
}
