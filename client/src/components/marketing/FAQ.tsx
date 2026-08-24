import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section } from "./Section";
import { faq } from "@/content/site";

export function FAQ() {
  return (
    <Section tone="oleo" id="faq" contentClassName="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h2 className="font-display text-titulo font-bold text-concreto">Dúvidas</h2>
      <Accordion type="single" collapsible className="mt-8 max-w-3xl border-t border-aco/25">
        {faq.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-aco/25">
            <AccordionTrigger className="font-body text-corpo-lg text-concreto hover:text-bjr hover:no-underline [&[data-state=open]>svg]:text-bjr">
              {item.pergunta}
            </AccordionTrigger>
            <AccordionContent className="font-body text-nota text-aco">{item.resposta}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
