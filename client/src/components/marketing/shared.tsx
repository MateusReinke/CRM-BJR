import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CodigoUnidade } from "@/content/site";

export function UnitChip({
  codigo,
  active,
  onClick,
}: {
  codigo: CodigoUnidade;
  active?: boolean;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-sharp border px-2 py-0.5 font-data text-legenda uppercase tracking-wide transition-colors",
        active ? "border-bjr bg-bjr text-concreto" : "border-aco/40 text-aco",
        onClick && "cursor-pointer hover:border-bjr hover:text-bjr focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr",
      )}
    >
      {codigo}
    </Tag>
  );
}

export function CTAButton({
  href,
  onClick,
  variant = "primary",
  type = "button",
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline-dark" | "outline-light";
  type?: "button" | "submit";
  children: ReactNode;
  className?: string;
}) {
  const styles: Record<string, string> = {
    primary: "border border-bjr bg-bjr text-concreto hover:bg-bjr/85",
    "outline-dark": "border border-aco/40 text-concreto hover:border-concreto",
    "outline-light": "border border-oleo/30 text-oleo hover:border-oleo",
  };

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-sharp px-5 py-3 font-body text-corpo font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bjr",
    styles[variant],
    className,
  );

  if (href) {
    const external = href.startsWith("http");
    return (
      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function StatusDot({ aberta }: { aberta: boolean }) {
  return <span aria-hidden="true" className={cn("inline-block h-2 w-2 rounded-full", aberta ? "bg-ambar animate-pulse" : "bg-aco/50")} />;
}

export function GridLines({ columns = 12 }: { columns?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      {Array.from({ length: columns + 1 }).map((_, i) => (
        <div key={i} className="absolute inset-y-0 w-px bg-aco/[0.12]" style={{ left: `${(i / columns) * 100}%` }} />
      ))}
    </div>
  );
}

export function PlaceholderFoto({ label }: { label: string }) {
  return (
    <div
      className="flex aspect-[16/9] w-full items-center justify-center border border-dashed border-aco/40 bg-oleo/40 font-data text-legenda uppercase tracking-wide text-aco"
      role="img"
      aria-label={`Foto pendente: ${label}`}
    >
      TODO: FOTO — {label}
    </div>
  );
}
