import { Section } from "./Section";
import { UnitChip, CTAButton, StatusDot, PlaceholderFoto } from "./shared";
import { ServiceOrderCard, FichaCampo, FichaDivisor } from "./ServiceOrderCard";
import { useReveal } from "@/hooks/use-reveal";
import { useOpenStatus } from "@/hooks/use-open-status";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { unidades, type CodigoUnidade, type Unidade } from "@/content/site";

function UnitCard({ unidade, index }: { unidade: Unidade; index: number }) {
  const { ref, className, style } = useReveal<HTMLDivElement>(index * 70);
  const status = useOpenStatus(unidade.horario);
  const whatsappUrl = buildWhatsAppUrl(unidade.whatsapp, `Olá! Quero falar com a unidade ${unidade.codigo}.`);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${unidade.lat},${unidade.lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${unidade.lat}%2C${unidade.lng}&navigate=yes`;
  const telefoneDigits = unidade.telefone.replace(/\D/g, "");

  return (
    <div ref={ref} id={`unidade-${unidade.codigo}`} style={style} className={cn(className, "scroll-mt-32")}>
      <ServiceOrderCard
        codigo={`${unidade.codigo} · ${unidade.tipo === "matriz" ? "MATRIZ" : "FILIAL"}`}
        stampLabel={unidade.tipo === "matriz" ? "MATRIZ" : "BJR"}
      >
        <PlaceholderFoto label={unidade.nome} />
        <FichaDivisor />
        <div className="grid grid-cols-2 gap-4">
          <FichaCampo label="Endereço" value={`${unidade.endereco} · ${unidade.bairro}, ${unidade.cidade}/${unidade.uf}`} />
          <FichaCampo
            label="Telefone"
            value={
              telefoneDigits ? (
                <a href={`tel:${telefoneDigits}`} className="hover:text-bjr focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr">
                  {unidade.telefone}
                </a>
              ) : (
                unidade.telefone
              )
            }
          />
          <FichaCampo
            label="Horário"
            value={
              <span className="flex items-center gap-1.5">
                <StatusDot aberta={status.aberta} />
                {status.label}
              </span>
            }
          />
          <FichaCampo label="Especialidade" value={unidade.especialidade} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <CTAButton href={mapsUrl} variant="outline-dark">
            Rota: Maps
          </CTAButton>
          <CTAButton href={wazeUrl} variant="outline-dark">
            Rota: Waze
          </CTAButton>
          <CTAButton href={whatsappUrl} variant="primary">
            WhatsApp da unidade
          </CTAButton>
        </div>
      </ServiceOrderCard>
    </div>
  );
}

export function Units({ nearestCodigo }: { nearestCodigo: CodigoUnidade }) {
  const [matriz, filial1, filial2] = unidades;

  return (
    <Section tone="concreto" id="unidades" contentClassName="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Único pin da página: cabeçalho de aba fixo enquanto as fichas rolam. */}
      <div className="sticky top-16 z-30 -mx-4 flex items-center justify-between gap-4 border-b border-aco/25 bg-concreto px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <h2 className="font-display text-rotulo font-bold text-oleo">Nossas unidades</h2>
        <nav aria-label="Ir para unidade" className="flex gap-2">
          {unidades.map((u) => (
            <a key={u.codigo} href={`#unidade-${u.codigo}`} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr">
              <UnitChip codigo={u.codigo} active={u.codigo === nearestCodigo} />
            </a>
          ))}
        </nav>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UnitCard unidade={matriz} index={0} />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-1">
          <UnitCard unidade={filial1} index={1} />
          <UnitCard unidade={filial2} index={2} />
        </div>
      </div>
    </Section>
  );
}
