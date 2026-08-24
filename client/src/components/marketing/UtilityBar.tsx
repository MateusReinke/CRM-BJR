import { StatusDot } from "./shared";
import { useOpenStatus } from "@/hooks/use-open-status";
import type { Unidade } from "@/content/site";

export function UtilityBar({
  unidade,
  distanciaKm,
  onTrocar,
}: {
  unidade: Unidade;
  distanciaKm: number | null;
  onTrocar: () => void;
}) {
  const status = useOpenStatus(unidade.horario);
  const telefoneDigits = unidade.telefone.replace(/\D/g, "");

  return (
    <div className="relative z-40 flex items-center justify-between gap-3 overflow-x-auto whitespace-nowrap border-b border-aco/20 bg-oleo px-3 py-1.5 font-data text-legenda text-aco sm:px-4">
      <div className="flex shrink-0 items-center gap-2">
        <StatusDot aberta={status.aberta} />
        <span className="text-concreto">{unidade.codigo}</span>
        <span>{status.label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <span className="hidden md:inline">
          DESPACHO → {unidade.codigo}
          {distanciaKm != null ? ` · ${distanciaKm.toFixed(1)}KM` : ""}
        </span>
        <button
          type="button"
          onClick={onTrocar}
          className="underline decoration-dotted underline-offset-2 hover:text-bjr focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr"
        >
          TROCAR
        </button>
        {telefoneDigits ? (
          <a href={`tel:${telefoneDigits}`} className="hover:text-bjr focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr">
            {unidade.telefone}
          </a>
        ) : (
          <span>{unidade.telefone}</span>
        )}
      </div>
    </div>
  );
}
