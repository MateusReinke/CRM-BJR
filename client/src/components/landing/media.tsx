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
}: {
  foto: Foto;
  className?: string;
  prioridade?: boolean;
}) {
  if (!foto.src) return <CenaEstrada className={className} />;

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

/**
 * Cena de estrada em SVG: asfalto em perspectiva, faixa central tracejada,
 * serra ao fundo e as diagonais vermelhas da marca. Usa `slice` para se
 * comportar como uma foto de fundo em qualquer proporção de tela.
 */
export function CenaEstrada({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="rv-ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12161B" />
          <stop offset="60%" stopColor="#1B2128" />
          <stop offset="100%" stopColor="#252C34" />
        </linearGradient>
        <linearGradient id="rv-asfalto" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#48525E" />
          <stop offset="45%" stopColor="#2A3038" />
          <stop offset="100%" stopColor="#12151A" />
        </linearGradient>
        <radialGradient id="rv-horizonte" cx="0.5" cy="1" r="0.85">
          <stop offset="0%" stopColor="#E10600" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E10600" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="700" fill="url(#rv-ceu)" />
      <ellipse cx="600" cy="352" rx="520" ry="150" fill="url(#rv-horizonte)" />

      {/* Serra ao fundo */}
      <path
        d="M0 352 L120 300 L215 336 L330 268 L455 330 L560 292 L640 336 L760 276 L880 332 L1000 296 L1110 340 L1200 310 L1200 356 L0 356Z"
        fill="#0E1216"
      />

      {/* Pista em perspectiva */}
      <path d="M600 352 L1420 700 L-220 700Z" fill="url(#rv-asfalto)" />

      {/* Bordas da pista */}
      <path d="M600 352 L1420 700 L1330 700 L592 354Z" fill="#E8E8EA" opacity="0.75" />
      <path d="M600 352 L-220 700 L-130 700 L608 354Z" fill="#E8E8EA" opacity="0.75" />

      {/* Faixa central tracejada, crescendo em direção ao observador */}
      {[
        { y: 372, h: 8, w: 3 },
        { y: 400, h: 13, w: 5 },
        { y: 440, h: 20, w: 8 },
        { y: 496, h: 30, w: 12 },
        { y: 572, h: 44, w: 18 },
        { y: 664, h: 56, w: 26 },
      ].map((d) => (
        <rect
          key={d.y}
          x={600 - d.w / 2}
          y={d.y}
          width={d.w}
          height={d.h}
          fill="#F2F2F3"
          opacity="0.85"
        />
      ))}

      {/* Diagonais vermelhas — o grafismo do wrap da picape */}
      <g opacity="0.9">
        <path d="M980 0 L1200 0 L1200 96 L1060 0Z" fill="#E10600" />
        <path d="M1104 108 L1200 132 L1200 196 L1064 152Z" fill="#E10600" opacity="0.55" />
        <path d="M0 700 L0 604 L152 700Z" fill="#E10600" opacity="0.4" />
      </g>

      {/* Vinheta para o texto do hero pousar sobre a imagem com contraste */}
      <rect width="1200" height="700" fill="url(#rv-vinheta)" />
      <defs>
        <linearGradient id="rv-vinheta" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.86" />
          <stop offset="55%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </svg>
  );
}
