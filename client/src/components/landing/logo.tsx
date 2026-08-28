// ---------------------------------------------------------------------------
// Logotipo Rede Vias — reconstruído a partir das peças da campanha.
//
// "REDE" em branco sobre "VIAS" em vermelho, com a curva de rodovia (faixa
// vermelha + tracejado central) saindo do "S"; abaixo, "SERVIÇOS AUTOMOTIVOS"
// com a bandeira do Brasil ao lado.
//
// O wordmark é texto real (HTML) e não imagem: fica nítido em qualquer tela,
// escala com font-size, é selecionável e não custa nenhuma requisição. Só a
// curva da rodovia e a bandeira são SVG.
// ---------------------------------------------------------------------------

import type { CSSProperties } from "react";

import { MARCA } from "@/data/rede-vias";

/** Curva de rodovia que acompanha o "VIAS" — faixa vermelha com tracejado. */
function CurvaRodovia({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 64"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Faixa de asfalto: arco que sobe da esquerda para a direita. */}
      <path
        d="M4 58C30 58 74 44 112 6"
        stroke="currentColor"
        strokeWidth="13"
        strokeLinecap="round"
      />
      {/* Tracejado central da pista. */}
      <path
        d="M8 57C33 56 74 42 110 7"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="7 8"
        opacity="0.92"
      />
    </svg>
  );
}

/** Bandeira do Brasil — o único ponto de verde/amarelo/azul da identidade. */
export function BandeiraBR({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="28" height="20" rx="2" fill="#009B3A" />
      <path d="M14 2.6 25.4 10 14 17.4 2.6 10z" fill="#FEDF00" />
      <circle cx="14" cy="10" r="4.1" fill="#002776" />
      <path
        d="M10.2 8.6a10 10 0 0 1 7.6 2.3"
        stroke="#ffffff"
        strokeWidth="1.1"
        fill="none"
      />
    </svg>
  );
}

export function RedeViasLogo({
  className = "",
  style,
  /** "completo" traz a linha SERVIÇOS AUTOMOTIVOS; "compacto" só o wordmark. */
  variante = "completo",
}: {
  className?: string;
  style?: CSSProperties;
  variante?: "completo" | "compacto";
}) {
  return (
    <span
      className={`rv-logo ${className}`}
      style={style}
      role="img"
      aria-label={MARCA.nomeCompleto}
    >
      <span className="rv-logo__wordmark" aria-hidden="true">
        <span className="rv-logo__rede">REDE</span>
        <span className="rv-logo__linha-vias">
          <span className="rv-logo__vias">VIAS</span>
          <CurvaRodovia className="rv-logo__curva" />
        </span>
        {variante === "completo" && (
          <span className="rv-logo__tagline">
            <span className="rv-logo__tagline-texto">SERVIÇOS AUTOMOTIVOS</span>
            <BandeiraBR className="rv-logo__bandeira" />
          </span>
        )}
      </span>
    </span>
  );
}

export default RedeViasLogo;
