import { ShieldCheck } from "lucide-react";
import { Section } from "./Section";
import { empresa, credenciamento } from "@/content/site";

export function Credentialing() {
  return (
    <Section tone="oleo" id="garantia" contentClassName="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto flex h-40 w-40 rotate-[-4deg] flex-col items-center justify-center rounded-full border-2 border-ambar">
        <span className="font-data text-dado-xl font-bold tabular-nums text-ambar">{empresa.garantiaDias}</span>
        <span className="font-data text-legenda uppercase tracking-wide text-ambar">dias de garantia</span>
        <span className="mt-1 font-data text-nota tabular-nums text-ambar">{empresa.garantiaKm.toLocaleString("pt-BR")}km</span>
      </div>
      <p className="mx-auto mt-6 max-w-md font-display text-rotulo font-bold uppercase text-concreto">
        Garantia de oficina, não promessa de vitrine
      </p>

      <div className="mx-auto mt-16 max-w-xl">
        <h2 className="font-data text-legenda uppercase tracking-wide text-aco">Credenciada por</h2>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-10 gap-y-6">
          {credenciamento.seguradoras.map((s, i) => (
            <li key={i} className="flex w-32 flex-col items-center gap-2">
              <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full border border-aco/40 text-aco">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="font-body text-nota text-aco">{s.nome}</span>
              {s.desde && <span className="font-data text-legenda text-aco">DESDE {s.desde}</span>}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
