import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Every marketing section renders its own solid Óleo/Concreto surface as a
 * z-0 layer, its actual content as a z-20 layer, and neither wrapper sets
 * position+z-index on itself — so both stay in the page's root stacking
 * context, comparable directly against BackgroundCanvas's fixed z-10
 * layer. That's what lets one global canvas paint icons "inside" every
 * section's flat color, under the text, without a canvas per section.
 * The data-bjr-tone attribute is how BackgroundCanvas finds section
 * boundaries and picks light-ink vs dark-ink icons per scroll position.
 */
export function Section({
  tone,
  id,
  className,
  contentClassName,
  children,
  as = "section",
}: {
  tone: "oleo" | "concreto";
  id?: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  as?: ElementType;
}) {
  const Tag = as;
  return (
    <Tag id={id} className={cn("relative", className)} data-bjr-tone={tone}>
      <div
        className={cn("pointer-events-none absolute inset-0 z-0", tone === "oleo" ? "bg-oleo" : "bg-concreto")}
        aria-hidden="true"
      />
      <div className={cn("relative z-20", contentClassName)}>{children}</div>
    </Tag>
  );
}
