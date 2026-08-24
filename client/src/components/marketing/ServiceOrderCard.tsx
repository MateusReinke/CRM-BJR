import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The signature element ("Ficha de Serviço"): a work-order shell used by
 * both the Hero (illustrative sample OS) and Unidades (one real ficha per
 * unit). Always renders on its own Óleo surface regardless of the section
 * it sits in — that's a token rule, not a style choice: Âmbar data only
 * reads on Óleo (see design tokens), so the card carries its own dark
 * ground wherever it lands, on a Concreto section or an Óleo one.
 */
export function ServiceOrderCard({
  codigo,
  eyebrow,
  stampLabel,
  className,
  children,
}: {
  codigo: string;
  eyebrow?: string;
  stampLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative border border-aco/25 bg-oleo p-5 text-concreto shadow-[0_24px_48px_-28px_rgba(0,0,0,0.7)] sm:p-6",
        className,
      )}
    >
      <header className="flex items-baseline justify-between gap-3 font-data text-dado uppercase tracking-wide text-aco">
        <span>{codigo}</span>
        {eyebrow && <span>{eyebrow}</span>}
      </header>
      <FichaDivisor />
      {children}
      {stampLabel && (
        <div
          aria-hidden="true"
          className="absolute -bottom-4 -right-3 flex h-16 w-16 rotate-[-4deg] select-none items-center justify-center rounded-full border-2 border-bjr text-center font-display text-[0.6rem] font-bold uppercase leading-tight tracking-wide text-bjr"
        >
          {stampLabel}
        </div>
      )}
    </div>
  );
}

export function FichaDivisor() {
  return (
    <div className="my-3 space-y-[3px]" aria-hidden="true">
      <div className="h-px bg-aco/30" />
      <div className="h-px bg-aco/30" />
    </div>
  );
}

export function FichaCampo({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="font-data text-legenda uppercase tracking-wide text-aco">{label}</div>
      <div className="font-body text-nota text-concreto">{value}</div>
    </div>
  );
}
