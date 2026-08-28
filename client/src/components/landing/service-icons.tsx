// ---------------------------------------------------------------------------
// Set de ícones dos serviços — desenhado especificamente para a Rede Vias,
// espelhando os seis ícones aplicados na tampa da picape.
//
// Regras do set (o que mantém a coerência visual): grid de 24×24, traço de
// 1.6 com pontas e junções arredondadas, sem preenchimento, mesmo peso óptico
// e mesma margem interna. A cor vem de `currentColor`, então cada ícone se
// adapta ao fundo em que é usado.
// ---------------------------------------------------------------------------

import type { SVGProps } from "react";

type IconeProps = SVGProps<SVGSVGElement>;

const base: IconeProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
};

/** Pneu: flanco, aro e a banda de rodagem como anel de blocos. */
export function IconePneus(props: IconeProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.2" />
      {/* O tracejado neste anel são os blocos da banda de rodagem. */}
      <circle cx="12" cy="12" r="6.7" strokeWidth="2.2" strokeDasharray="1.6 2.7" />
    </svg>
  );
}

/** Suspensão: amortecedor com mola helicoidal e olhais de fixação. */
export function IconeSuspensao(props: IconeProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2v2.4" />
      <circle cx="12" cy="2.6" r="1.4" />
      <path d="M8.4 5.4h7.2l-7.2 2.6h7.2l-7.2 2.6h7.2l-7.2 2.6h7.2l-7.2 2.6h7.2" />
      <path d="M12 16.2v3.6" />
      <circle cx="12" cy="21.2" r="1.4" />
    </svg>
  );
}

/** Freios: disco ventilado com a pinça encaixada na borda. */
export function IconeFreios(props: IconeProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="12" r="8.2" />
      <circle cx="11" cy="12" r="2.8" />
      <path d="M11 3.8v2.4M11 17.8v2.4M2.8 12h2.4M16.8 12h2.4" />
      <path d="M17.6 7.6h2.6a1.4 1.4 0 0 1 1.4 1.4v6a1.4 1.4 0 0 1-1.4 1.4h-2.6" />
    </svg>
  );
}

/** Alinhamento: as duas rodas vistas de cima, convergindo sobre o eixo. */
export function IconeAlinhamento(props: IconeProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.8" y="5.6" width="3.6" height="12.8" rx="1.4" transform="rotate(-9 4.6 12)" />
      <rect x="17.6" y="5.6" width="3.6" height="12.8" rx="1.4" transform="rotate(9 19.4 12)" />
      <path d="M6.8 12h10.4" />
      <path d="M12 2.6v18.8" strokeDasharray="2.2 2.4" />
    </svg>
  );
}

/** Balanceamento: roda com o contrapeso preso na borda. */
export function IconeBalanceamento(props: IconeProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="2.2" />
      {/* O contrapeso — é ele que dá nome ao serviço. */}
      <rect x="9.9" y="2.2" width="4.2" height="2.6" rx="0.7" />
      <path d="M12 4.8v5M6.2 8.7l3.9 2.2M17.8 8.7l-3.9 2.2M9.4 18.6l1.5-4.6M14.6 18.6l-1.5-4.6" />
    </svg>
  );
}

/** Troca de óleo: galão com bico longo e a gota caindo. */
export function IconeTrocaDeOleo(props: IconeProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12.6a1.6 1.6 0 0 1 1.6-1.6h6.6l3.4 2.4h2.2a2.6 2.6 0 0 1 2.6 2.6v2a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 18v-5.4Z" />
      <path d="M7.6 11V9.2h4.2" />
      <path d="M14.6 13.4 20.4 8" />
      <path d="M18.6 3c1.5 1.9 2.2 3.2 2.2 4.1a2.2 2.2 0 0 1-4.4 0c0-.9.7-2.2 2.2-4.1Z" />
    </svg>
  );
}

export const ICONES_SERVICOS: Record<string, (props: IconeProps) => JSX.Element> = {
  pneus: IconePneus,
  suspensao: IconeSuspensao,
  freios: IconeFreios,
  alinhamento: IconeAlinhamento,
  balanceamento: IconeBalanceamento,
  "troca-de-oleo": IconeTrocaDeOleo,
};

// ---------------------------------------------------------------------------
// Ícones dos diferenciais — mesmo grid e mesmo traço do set acima.
// ---------------------------------------------------------------------------

/** Segurança: escudo com o "check". */
export function IconeSeguranca(props: IconeProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.8 4.6 5.8v5.6c0 4.3 3 8.2 7.4 9.8 4.4-1.6 7.4-5.5 7.4-9.8V5.8L12 2.8Z" />
      <path d="m8.8 11.8 2.3 2.4 4.1-4.6" />
    </svg>
  );
}

/** Conforto: banco automotivo de perfil. */
export function IconeConforto(props: IconeProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7.4 3.6h3.4a2 2 0 0 1 2 2v7.2H9.4a2 2 0 0 1-2-2V3.6Z" />
      <path d="M12.8 12.8h4.6a2 2 0 0 1 2 2v1.4a2 2 0 0 1-2 2H7.2" />
      <path d="M5.4 8.6v10.4a1.4 1.4 0 0 0 1.4 1.4h1" />
    </svg>
  );
}

/** Qualidade: selo com fita. */
export function IconeQualidade(props: IconeProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9.4" r="6.4" />
      <path d="M12 6.2 13 8.3l2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3L12 6.2Z" />
      <path d="M8.6 15.2 7.4 21.4l4.6-2.4 4.6 2.4-1.2-6.2" />
    </svg>
  );
}

/** Equipe especializada: chave de boca cruzada com chave de fenda. */
export function IconeEquipe(props: IconeProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15.6 3.4a4.4 4.4 0 0 0-5.2 5.9L3.4 16.3a1.8 1.8 0 0 0 0 2.6l1.7 1.7a1.8 1.8 0 0 0 2.6 0l7-7a4.4 4.4 0 0 0 5.9-5.2l-2.9 2.9-2.6-.7-.7-2.6 2.6-2.6Z" />
      <path d="m6.2 17.8.6.6" />
    </svg>
  );
}

export const ICONES_DIFERENCIAIS: Record<string, (props: IconeProps) => JSX.Element> = {
  seguranca: IconeSeguranca,
  conforto: IconeConforto,
  qualidade: IconeQualidade,
  equipe: IconeEquipe,
};
