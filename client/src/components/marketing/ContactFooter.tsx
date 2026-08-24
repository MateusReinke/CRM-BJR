import { useState, type FormEvent, type ReactNode } from "react";
import { Section } from "./Section";
import { CTAButton, UnitChip } from "./shared";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { empresa, unidades, unidadePorCodigo, type CodigoUnidade } from "@/content/site";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-data text-legenda uppercase tracking-wide text-aco">{label}</span>
      {children}
    </label>
  );
}

const inputClasses =
  "border border-aco/40 bg-transparent px-3 py-2 font-body text-corpo text-concreto placeholder:text-aco/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr";

export function ContactFooter({ nearestCodigo }: { nearestCodigo: CodigoUnidade }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [unidadeCodigo, setUnidadeCodigo] = useState<CodigoUnidade>(nearestCodigo);
  const [descricao, setDescricao] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const unidade = unidadePorCodigo(unidadeCodigo);
    const mensagem = [
      "Olá! Quero abrir uma ordem de serviço.",
      nome && `Nome: ${nome}`,
      telefone && `Telefone: ${telefone}`,
      veiculo && `Veículo: ${veiculo}`,
      `Unidade: ${unidadeCodigo}`,
      descricao && `O que está acontecendo: ${descricao}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(buildWhatsAppUrl(unidade.whatsapp, mensagem), "_blank", "noopener,noreferrer");
  }

  return (
    <Section tone="oleo" id="contato" as="footer" contentClassName="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h2 className="font-display text-titulo font-bold text-concreto">Abrir ordem de serviço</h2>
      <form onSubmit={handleSubmit} className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClasses} />
        </Field>
        <Field label="Telefone">
          <input required value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputClasses} />
        </Field>
        <Field label="Veículo">
          <input
            placeholder="Modelo e ano"
            value={veiculo}
            onChange={(e) => setVeiculo(e.target.value)}
            className={inputClasses}
          />
        </Field>
        <Field label="Unidade">
          <select value={unidadeCodigo} onChange={(e) => setUnidadeCodigo(e.target.value as CodigoUnidade)} className={inputClasses}>
            {unidades.map((u) => (
              <option key={u.codigo} value={u.codigo}>
                {u.codigo} · {u.nome}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="O que está acontecendo">
            <textarea
              required
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={inputClasses}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <CTAButton type="submit" variant="primary" className="w-full sm:w-auto">
            Abrir OS pelo WhatsApp
          </CTAButton>
        </div>
      </form>

      <div className="mt-16 flex flex-col gap-6 border-t border-aco/25 pt-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-rotulo font-bold text-concreto">{empresa.nome}</p>
          <p className="mt-1 font-data text-legenda text-aco">CNPJ {empresa.cnpj}</p>
          <div className="mt-2 flex gap-2">
            {unidades.map((u) => (
              <UnitChip key={u.codigo} codigo={u.codigo} />
            ))}
          </div>
        </div>
        <div className="font-body text-nota text-aco sm:text-right">
          <p>{empresa.email}</p>
          <p>{empresa.instagram} · {empresa.facebook}</p>
          <p className="mt-2 max-w-sm text-legenda text-aco/80">{empresa.lgpdTexto}</p>
          <p className="mt-2 font-data text-legenda text-aco">© {new Date().getFullYear()} {empresa.nome}. Todos os direitos reservados.</p>
        </div>
      </div>
    </Section>
  );
}
