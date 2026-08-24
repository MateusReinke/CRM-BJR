import { Section } from "./Section";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import { depoimentos, type Depoimento } from "@/content/site";

function TestimonialCard({ depoimento, index }: { depoimento: Depoimento; index: number }) {
  const { ref, className, style } = useReveal<HTMLDivElement>(index * 70);
  return (
    <div ref={ref} style={style} className={cn(className, "mb-6 break-inside-avoid border border-aco/25 bg-oleo p-5")}>
      <p className="font-body text-nota text-concreto">&ldquo;{depoimento.texto}&rdquo;</p>
      <span className="mt-3 inline-block border border-aco/40 px-1.5 py-0.5 font-data text-legenda uppercase tracking-wide text-ambar">
        {depoimento.categoria}
      </span>
      <p className="mt-2 font-data text-legenda text-aco">
        {depoimento.nome} · {depoimento.unidade} · {depoimento.data}
      </p>
    </div>
  );
}

export function Testimonials() {
  return (
    <Section tone="concreto" id="depoimentos" contentClassName="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h2 className="font-display text-titulo font-bold text-oleo">Quem já passou por aqui</h2>

      {depoimentos.length > 0 ? (
        <div className="mt-8 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {depoimentos.map((d, i) => (
            <TestimonialCard key={d.id} depoimento={d} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-dashed border-aco/40 p-5">
              <p className="font-body text-nota text-aco-claro">TODO: depoimento real do Google — nome, unidade, serviço realizado.</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
