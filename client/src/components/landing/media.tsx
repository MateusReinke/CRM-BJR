// ---------------------------------------------------------------------------
// Camada de imagem da homepage.
//
// As fotos de campanha (picape com o wrap na estrada, cena de pane com o
// triângulo) entram por client/public/imagens/ — veja o LEIA-ME de lá. Enquanto
// o caminho estiver vazio em FOTOS (src/data/rede-vias.ts), a página desenha a
// cena de estrada em SVG abaixo: nenhuma requisição, poucos KB, nítida em
// qualquer densidade de tela. Assim a home nunca fica com buraco de imagem e
// nunca carrega um placeholder pesado.
// ---------------------------------------------------------------------------

import type { Foto } from "@/data/rede-vias";

export function FotoOuCena({
  foto,
  className,
  /** true apenas para a imagem acima da dobra (hero): carrega sem lazy. */
  prioridade = false,
  variante = "estrada",
}: {
  foto: Foto;
  className?: string;
  prioridade?: boolean;
  variante?: "estrada" | "acostamento";
}) {
  if (!foto.src) {
    return variante === "acostamento" ? (
      <CenaAcostamento className={className} />
    ) : (
      <CenaEstrada className={className} />
    );
  }

  return (
    <img
      src={foto.src}
      srcSet={foto.srcSet || undefined}
      sizes={foto.sizes}
      alt={foto.alt}
      className={className}
      loading={prioridade ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

/** Definições reaproveitadas pelas duas cenas. */
function DefsCena({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-ceu`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#090B0F" />
        <stop offset="55%" stopColor="#161B22" />
        <stop offset="100%" stopColor="#2A323C" />
      </linearGradient>
      <linearGradient id={`${id}-asfalto`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#525C69" />
        <stop offset="30%" stopColor="#2E353F" />
        <stop offset="100%" stopColor="#0D0F13" />
      </linearGradient>
      <radialGradient id={`${id}-horizonte`} cx="0.5" cy="1" r="0.9">
        <stop offset="0%" stopColor="#E10600" stopOpacity="0.75" />
        <stop offset="45%" stopColor="#E10600" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#E10600" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-bruma`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8FA3B8" stopOpacity="0" />
        <stop offset="100%" stopColor="#8FA3B8" stopOpacity="0.22" />
      </linearGradient>
    </defs>
  );
}

/**
 * Cena de estrada em SVG: céu em degradê, serra em três profundidades, brilho
 * de horizonte na cor da marca, asfalto em perspectiva com faixa central e
 * defensa metálica na lateral. Usa `slice` para se comportar como uma foto de
 * fundo em qualquer proporção de tela.
 */
export function CenaEstrada({ className }: { className?: string }) {
  const horizonte = 340;
  const fuga = 600;

  return (
    <svg
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <DefsCena id="rv-e" />

      <rect width="1200" height="700" fill="url(#rv-e-ceu)" />
      <ellipse cx={fuga} cy={horizonte + 10} rx="620" ry="185" fill="url(#rv-e-horizonte)" />

      {/* Serra: três camadas, da mais distante para a mais próxima. */}
      <path
        d="M0 344 L110 292 L205 328 L320 258 L450 322 L560 284 L640 330 L770 266 L900 326 L1020 288 L1120 334 L1200 304 L1200 348 L0 348Z"
        fill="#141A21"
        opacity="0.9"
      />
      <path
        d="M0 352 L90 318 L190 344 L300 300 L420 342 L540 312 L660 346 L790 306 L910 344 L1040 316 L1150 348 L1200 330 L1200 356 L0 356Z"
        fill="#0E1319"
      />
      <rect y={horizonte - 6} width="1200" height="24" fill="url(#rv-e-bruma)" />

      {/* Pista em perspectiva */}
      <path d={`M${fuga} ${horizonte} L1460 700 L-260 700Z`} fill="url(#rv-e-asfalto)" />

      {/* Bordas contínuas da pista */}
      <path
        d={`M${fuga} ${horizonte} L1460 700 L1360 700 L${fuga - 9} ${horizonte + 3}Z`}
        fill="#EDEEF0"
        opacity="0.8"
      />
      <path
        d={`M${fuga} ${horizonte} L-260 700 L-160 700 L${fuga + 9} ${horizonte + 3}Z`}
        fill="#EDEEF0"
        opacity="0.8"
      />

      {/* Faixa central tracejada, crescendo em direção ao observador */}
      {[
        { y: 356, h: 9, w: 3 },
        { y: 386, h: 14, w: 5 },
        { y: 430, h: 22, w: 8 },
        { y: 492, h: 33, w: 12 },
        { y: 576, h: 48, w: 18 },
        { y: 672, h: 60, w: 27 },
      ].map((d) => (
        <rect
          key={d.y}
          x={fuga - d.w / 2}
          y={d.y}
          width={d.w}
          height={d.h}
          fill="#F4F5F6"
          opacity="0.9"
        />
      ))}

      {/* Defensa metálica à direita, com os postes encurtando na distância */}
      <path d={`M${fuga + 40} ${horizonte + 2} L1200 470 L1200 496 L${fuga + 40} ${horizonte + 10}Z`} fill="#5A6472" opacity="0.75" />
      {[
        { x: 700, y: 372, h: 26 },
        { x: 810, y: 396, h: 38 },
        { x: 950, y: 428, h: 54 },
        { x: 1120, y: 468, h: 76 },
      ].map((p) => (
        <rect key={p.x} x={p.x} y={p.y} width="5" height={p.h} fill="#39414C" opacity="0.85" />
      ))}

      {/* Diagonais vermelhas — o grafismo do wrap da picape */}
      <g>
        <path d="M955 0 L1200 0 L1200 118 L1040 0Z" fill="#E10600" />
        <path d="M1090 132 L1200 162 L1200 236 L1050 176Z" fill="#E10600" opacity="0.55" />
        <path d="M0 700 L0 588 L176 700Z" fill="#E10600" opacity="0.35" />
      </g>
    </svg>
  );
}

/**
 * Cena de acostamento: a pista vista de lado, com o triângulo de segurança em
 * primeiro plano — o assunto do bloco de prevenção das peças.
 */
export function CenaAcostamento({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <DefsCena id="rv-a" />

      <rect width="1200" height="900" fill="url(#rv-a-ceu)" />
      <ellipse cx="820" cy="430" rx="640" ry="210" fill="url(#rv-a-horizonte)" />

      <path
        d="M0 432 L150 386 L280 424 L420 366 L580 420 L720 380 L860 426 L1010 384 L1140 428 L1200 404 L1200 440 L0 440Z"
        fill="#101620"
      />
      <rect y="424" width="1200" height="30" fill="url(#rv-a-bruma)" />

      {/* Pista descendo da esquerda para a direita */}
      <path d="M0 470 L1200 440 L1200 900 L0 900Z" fill="url(#rv-a-asfalto)" />
      {/* Faixa contínua do acostamento */}
      <path d="M0 560 L1200 520 L1200 540 L0 582Z" fill="#EDEEF0" opacity="0.55" />
      {/* Tracejado da pista */}
      {[
        { x: 60, w: 130 },
        { x: 300, w: 150 },
        { x: 590, w: 170 },
        { x: 920, w: 200 },
      ].map((d) => (
        <path
          key={d.x}
          d={`M${d.x} 726 L${d.x + d.w} 716 L${d.x + d.w} 742 L${d.x} 754Z`}
          fill="#F4F5F6"
          opacity="0.75"
        />
      ))}

      {/* Triângulo de segurança — o elemento que dá o assunto à cena */}
      <g transform="translate(300 470) scale(1.5)">
        <path
          d="M100 20 L182 168 L18 168 Z"
          fill="none"
          stroke="#E10600"
          strokeWidth="17"
          strokeLinejoin="round"
        />
        <path
          d="M100 52 L152 152 L48 152 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinejoin="round"
          opacity="0.85"
        />
        {/* Base de apoio */}
        <rect x="52" y="168" width="96" height="11" rx="5" fill="#2A3038" />
      </g>

      {/* Sombra projetada do triângulo no asfalto */}
      <ellipse cx="450" cy="742" rx="150" ry="20" fill="#000000" opacity="0.5" />

      <path d="M1010 0 L1200 0 L1200 128 L1090 0Z" fill="#E10600" opacity="0.85" />
    </svg>
  );
}
