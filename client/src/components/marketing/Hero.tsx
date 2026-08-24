import { useMemo } from "react";
import { Section } from "./Section";
import { GridLines, CTAButton } from "./shared";
import { ServiceOrderCard, FichaCampo, FichaDivisor } from "./ServiceOrderCard";
import { useReveal } from "@/hooks/use-reveal";
import { useCountUp } from "@/hooks/use-count-up";
import { useParallax } from "@/hooks/use-parallax";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { empresa, type Unidade } from "@/content/site";

const DIAGNOSTICO = ["Freios", "Suspensão", "Elétrica", "Ar-condicionado"];

export function Hero({ unidade }: { unidade: Unidade }) {
  const headlineRef = useParallax<HTMLHeadingElement>(0.3);
  const { ref: statsRef, isVisible: statsVisible } = useReveal<HTMLDivElement>();
  const anos = useCountUp(15, statsVisible);
  const unidadesCount = useCountUp(3, statsVisible);
  const garantiaDias = useCountUp(empresa.garantiaDias, statsVisible);

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(unidade.whatsapp, `Olá! Vim pelo site da BJR e quero um orçamento na unidade ${unidade.codigo}.`),
    [unidade],
  );

  return (
    <Section tone="oleo" id="top" contentClassName="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="relative">
        <GridLines />
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-7">
            <h1
              ref={headlineRef}
              className="font-display text-display font-extrabold uppercase leading-[0.95] text-concreto"
            >
              O barulho não some sozinho.
            </h1>
            <p className="mt-6 max-w-xl font-body text-corpo-lg text-aco">
              Diagnóstico técnico, orçamento pelo WhatsApp e sua ordem de serviço documentada do início ao fim —
              SP1, SP2 e Sorocaba.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton href={whatsappUrl} variant="primary">
                Pedir orçamento no WhatsApp
              </CTAButton>
              <CTAButton href="#unidades" variant="outline-dark">
                Ver as 3 unidades
              </CTAButton>
            </div>
          </div>

          <div className="lg:col-span-5">
            <ServiceOrderCard
              codigo="OS Nº 000/2026"
              eyebrow="MODELO"
              stampLabel="BJR"
              className="mx-auto max-w-sm md:-rotate-2"
            >
              <div className="font-data text-legenda uppercase tracking-wide text-aco">Diagnóstico</div>
              <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 font-body text-nota text-concreto">
                {DIAGNOSTICO.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-3 w-3 shrink-0 border border-aco/50" />
                    {item}
                  </li>
                ))}
              </ul>

              <FichaDivisor />

              <div ref={statsRef} className="grid grid-cols-3 gap-3">
                <FichaCampo
                  label="Anos de oficina"
                  value={
                    <span className="font-data text-dado-lg tabular-nums text-ambar">
                      {anos}+
                    </span>
                  }
                />
                <FichaCampo
                  label="Unidades"
                  value={
                    <span className="font-data text-dado-lg tabular-nums text-ambar">
                      {unidadesCount}
                    </span>
                  }
                />
                <FichaCampo
                  label="Garantia"
                  value={
                    <span className="font-data text-dado-lg tabular-nums text-ambar">
                      {garantiaDias}D
                    </span>
                  }
                />
              </div>
            </ServiceOrderCard>
          </div>
        </div>
      </div>
    </Section>
  );
}
