import { useState } from "react";
import { Section } from "./Section";
import { UnitChip, CTAButton } from "./shared";
import { useReveal } from "@/hooks/use-reveal";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { promocoes, unidadePorCodigo, type CodigoUnidade, type Promocao } from "@/content/site";

function PromoCard({ promo, index, nearestCodigo }: { promo: Promocao; index: number; nearestCodigo: CodigoUnidade }) {
  const { ref, className, style } = useReveal<HTMLDivElement>(index * 70);
  const targetCodigo = promo.unidades.includes(nearestCodigo) ? nearestCodigo : promo.unidades[0];
  const unidade = unidadePorCodigo(targetCodigo);
  const whatsappUrl = buildWhatsAppUrl(
    unidade.whatsapp,
    `Olá! Vi a promoção "${promo.titulo}" no site e quero aproveitar na unidade ${unidade.codigo}.`,
  );

  return (
    <div
      ref={ref}
      style={style}
      className={cn(className, "flex w-[85vw] max-w-xs shrink-0 snap-start flex-col border border-aco/25 bg-oleo p-5 sm:w-72")}
    >
      <h3 className="font-display text-rotulo font-bold text-concreto">{promo.titulo}</h3>
      <ul className="mt-3 space-y-1 font-body text-nota text-aco">
        {promo.inclui.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
      <div className="my-4 h-px bg-aco/25" aria-hidden="true" />
      <div className="flex items-baseline gap-2 font-data">
        {promo.descontoPercentual != null && <span className="text-dado-lg tabular-nums text-ambar">{promo.descontoPercentual}% OFF</span>}
        {promo.descontoPercentual == null && promo.precoPor != null && (
          <span className="text-dado-lg tabular-nums text-ambar">R$ {promo.precoPor}</span>
        )}
        <span className="text-legenda text-aco">VÁL {promo.validade}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {promo.unidades.map((codigo) => (
          <UnitChip key={codigo} codigo={codigo} active={codigo === targetCodigo} />
        ))}
      </div>
      <p className="mt-3 flex-1 font-body text-legenda text-aco">{promo.condicoes}</p>
      <CTAButton href={whatsappUrl} variant="primary" className="mt-4 w-full">
        Chamar no WhatsApp
      </CTAButton>
    </div>
  );
}

function EmptyState() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  return (
    <div className="flex w-[85vw] max-w-xs shrink-0 snap-start flex-col border border-dashed border-aco/40 p-5 sm:w-72">
      <p className="font-display text-rotulo font-bold text-oleo">Sem promoções ativas</p>
      <p className="mt-2 font-body text-nota text-aco-claro">Avise-me quando houver uma promoção na minha unidade.</p>
      {enviado ? (
        <p className="mt-4 font-data text-legenda font-semibold uppercase tracking-wide text-bjr">Recebido — avisamos você por aqui.</p>
      ) : (
        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: ligar este formulário a um endpoint real de captura de
            // contato — hoje só confirma na tela, não persiste em lugar algum.
            if (email.trim()) setEnviado(true);
          }}
        >
          <label htmlFor="promo-email" className="font-data text-legenda uppercase tracking-wide text-aco-claro">
            Seu e-mail ou WhatsApp
          </label>
          <input
            id="promo-email"
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-aco/40 bg-transparent px-3 py-2 font-body text-nota text-oleo focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr"
          />
          <CTAButton type="submit" variant="primary">
            Avisar
          </CTAButton>
        </form>
      )}
    </div>
  );
}

export function Promotions({ nearestCodigo }: { nearestCodigo: CodigoUnidade }) {
  return (
    <Section tone="concreto" id="promocoes" contentClassName="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h2 className="font-display text-titulo font-bold text-oleo">Promoções</h2>
      <p className="mt-1 font-body text-corpo-lg text-aco-claro">ativas nas 3 unidades</p>

      <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        {promocoes.length > 0
          ? promocoes.map((promo, i) => <PromoCard key={promo.id} promo={promo} index={i} nearestCodigo={nearestCodigo} />)
          : <EmptyState />}
      </div>
    </Section>
  );
}
