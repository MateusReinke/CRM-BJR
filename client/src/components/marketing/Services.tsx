import { ChevronDown } from "lucide-react";
import { Section } from "./Section";
import { CTAButton } from "./shared";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { servicos, unidadePorCodigo, type CodigoUnidade, type ItemServico } from "@/content/site";

export function Services({ nearestCodigo }: { nearestCodigo: CodigoUnidade }) {
  const unidade = unidadePorCodigo(nearestCodigo);

  return (
    <Section tone="oleo" id="servicos" contentClassName="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h2 className="font-display text-titulo font-bold text-concreto">O que a gente resolve</h2>

      <div className="mt-8 border-t border-aco/25">
        {servicos.map((servico, i) => (
          <ServiceRow key={servico.slug} servico={servico} index={i} unidadeWhatsapp={unidade.whatsapp} unidadeCodigo={unidade.codigo} />
        ))}
      </div>
    </Section>
  );
}

function ServiceRow({
  servico,
  index,
  unidadeWhatsapp,
  unidadeCodigo,
}: {
  servico: ItemServico;
  index: number;
  unidadeWhatsapp: string;
  unidadeCodigo: CodigoUnidade;
}) {
  const whatsappUrl = buildWhatsAppUrl(
    unidadeWhatsapp,
    `Olá! Quero um orçamento de ${servico.categoria.toLowerCase()} na unidade ${unidadeCodigo}.`,
  );

  return (
    <details className="group border-b border-aco/25 py-4 [&::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr">
        <span className="flex shrink-0 items-baseline gap-3 font-display text-rotulo font-bold text-concreto">
          <span className="font-data text-nota text-aco">{String(index + 1).padStart(2, "0")}</span>
          {servico.categoria}
        </span>
        <span aria-hidden="true" className="hidden flex-1 border-b border-dotted border-aco/30 sm:block" />
        <span className="ml-auto flex shrink-0 items-center gap-3 font-data text-nota sm:ml-0">
          <span className="whitespace-nowrap text-ambar">
            {servico.precoDesde != null ? `A PARTIR DE R$ ${servico.precoDesde}` : "SOB AVALIAÇÃO"}
          </span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-aco transition-transform duration-200 group-open:rotate-180" />
        </span>
      </summary>
      <div className="mt-3 pl-9">
        <p className="font-body text-nota text-aco">{servico.descricao}</p>
        <ul className="mt-2 grid grid-cols-1 gap-1 font-body text-nota text-concreto sm:grid-cols-2">
          {servico.itens.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
        <CTAButton href={whatsappUrl} variant="outline-dark" className="mt-4">
          Pedir orçamento
        </CTAButton>
      </div>
    </details>
  );
}
