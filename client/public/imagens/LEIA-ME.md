# Imagens da homepage

As fotos de campanha entram aqui e são referenciadas em
`client/src/data/rede-vias.ts` (objeto `FOTOS`). Enquanto o campo `src` estiver
vazio, a homepage desenha uma cena de estrada em SVG no lugar — leve, nítida em
qualquer tela e sem nenhuma requisição extra. Nada quebra até as fotos chegarem.

## Fotos esperadas

| Chave em `FOTOS` | Cena                                                          | Onde aparece                |
| ---------------- | ------------------------------------------------------------- | --------------------------- |
| `hero`           | Picape com o wrap da Rede Vias rodando na estrada             | Fundo do hero               |
| `prevencao`      | Cena de pane no acostamento com o triângulo de segurança      | Bloco "Cuidar do seu carro" |

## Como exportar

1. **Formato:** WebP com qualidade 72–80 (JPG só como fallback, se necessário).
2. **Tamanhos:** exporte a mesma foto em 800w, 1280w e 1920w. O hero é
   full-bleed; o bloco de prevenção ocupa metade da tela em desktop, então 1280w
   já basta.
3. **Peso alvo:** até 180 KB no hero e 120 KB nas demais. Acima disso, reduza a
   qualidade antes de reduzir a resolução.
4. **Recorte:** as duas imagens são exibidas com `object-fit: cover`. Deixe
   respiro nas bordas para que nenhum elemento essencial seja cortado — no hero,
   o texto ocupa o terço esquerdo em desktop.

## Como ligar no código

```ts
// client/src/data/rede-vias.ts
export const FOTOS: Record<"hero" | "prevencao", Foto> = {
  hero: {
    src: "/imagens/hero-estrada-1280.webp",
    srcSet:
      "/imagens/hero-estrada-800.webp 800w, " +
      "/imagens/hero-estrada-1280.webp 1280w, " +
      "/imagens/hero-estrada-1920.webp 1920w",
    sizes: "100vw",
    alt: "Picape da Rede Vias com adesivagem da marca rodando em uma estrada de serra",
  },
  // ...
};
```

O `alt` descreve a cena para quem usa leitor de tela — ajuste junto com a foto.
O hero carrega com `loading="eager"` (está acima da dobra) e as demais com
`loading="lazy"`; isso já é tratado pelo componente, não precisa mexer.
