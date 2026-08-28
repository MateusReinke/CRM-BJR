// ---------------------------------------------------------------------------
// Rede Vias Serviços Automotivos — fonte única de conteúdo da homepage.
// Tudo que muda com frequência (unidades, telefones, serviços, fotos) vive
// aqui para que a página não precise ser editada a cada ajuste comercial.
// ---------------------------------------------------------------------------

export const MARCA = {
  nome: "Rede Vias",
  nomeCompleto: "Rede Vias Serviços Automotivos",
  descricao:
    "Rede de centros automotivos especializados em pneus, suspensão, freios, alinhamento, balanceamento e troca de óleo.",
  site: "redevias.com.br",
  siteUrl: "https://redevias.com.br",
  instagram: {
    handle: "@redeviaspneus",
    url: "https://instagram.com/redeviaspneus",
  },
} as const;

export type Unidade = {
  id: string;
  nome: string;
  cidade: string;
  endereco: string;
  complemento: string;
  telefone: string;
  /** Somente dígitos, no formato aceito pelo wa.me (55 + DDD + número). */
  whatsapp: string;
  /** Texto usado para montar o mapa e o link "ver no Google Maps". */
  mapaQuery: string;
};

// NOTA COMERCIAL: Santo Amaro e Jardim Pedreira aparecem com o mesmo telefone
// nas peças de campanha (central única). Confirmar com o cliente antes de
// publicar — se cada loja tiver linha própria, basta trocar aqui.
export const UNIDADES: Unidade[] = [
  {
    id: "santo-amaro",
    nome: "Santo Amaro",
    cidade: "São Paulo/SP",
    endereco: "Alvarenga, 603",
    complemento: "Loja 1 — Santo Amaro/SP",
    telefone: "(11) 93702-8375",
    whatsapp: "5511937028375",
    mapaQuery: "Alvarenga, 603 - Santo Amaro, São Paulo - SP",
  },
  {
    id: "jardim-pedreira",
    nome: "Jardim Pedreira",
    cidade: "São Paulo/SP",
    endereco: "Estrada do Alvarenga, 1314",
    complemento: "Loja 2 — Jd. Pedreira, Santo Amaro/SP",
    telefone: "(11) 93702-8375",
    whatsapp: "5511937028375",
    mapaQuery: "Estrada do Alvarenga, 1314 - Jardim Pedreira, São Paulo - SP",
  },
  {
    id: "santos",
    nome: "Santos",
    cidade: "Santos/SP",
    endereco: "Av. Senador Feijó, 607",
    complemento: "Santos/SP",
    telefone: "(13) 99622-6147",
    whatsapp: "5513996226147",
    mapaQuery: "Avenida Senador Feijó, 607 - Santos - SP",
  },
  {
    id: "limeira",
    nome: "Limeira",
    cidade: "Limeira/SP",
    endereco: "Av. Campinas, 516",
    complemento: "Limeira/SP",
    telefone: "(19) 99747-1929",
    whatsapp: "5519997471929",
    mapaQuery: "Avenida Campinas, 516 - Limeira - SP",
  },
];

/** Unidade usada pelos CTAs gerais (header, hero, chamada final). */
export const UNIDADE_PADRAO = UNIDADES[0];

export function linkWhatsApp(
  whatsapp: string,
  mensagem = `Olá! Gostaria de agendar um serviço na ${MARCA.nome}.`,
) {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export function linkTelefone(telefone: string) {
  return `tel:+55${telefone.replace(/\D/g, "")}`;
}

export function linkMapa(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Mapa embutido — não exige chave de API e é carregado sob demanda. */
export function embedMapa(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export const DIFERENCIAIS = [
  { id: "seguranca", titulo: "Segurança", descricao: "para você e sua família" },
  { id: "conforto", titulo: "Conforto", descricao: "em cada trajeto" },
  { id: "qualidade", titulo: "Qualidade", descricao: "que você confia" },
  { id: "equipe", titulo: "Equipe especializada", descricao: "sempre pronta para te atender" },
] as const;

export const SERVICOS = [
  { id: "pneus", nome: "Pneus", descricao: "Venda, montagem, calibragem e reparo." },
  { id: "suspensao", nome: "Suspensão", descricao: "Amortecedores, molas e batentes." },
  { id: "freios", nome: "Freios", descricao: "Pastilhas, discos e revisão do sistema." },
  { id: "alinhamento", nome: "Alinhamento", descricao: "Geometria corrigida para rodar reto." },
  { id: "balanceamento", nome: "Balanceamento", descricao: "Fim das vibrações no volante." },
  { id: "troca-de-oleo", nome: "Troca de óleo", descricao: "Óleo, filtros e checagem de níveis." },
] as const;

// ---------------------------------------------------------------------------
// Fotografia
// ---------------------------------------------------------------------------
// As fotos das campanhas (picape com o wrap na estrada, cena de pane com
// triângulo) devem ser exportadas em WebP e colocadas em client/public/imagens/
// — veja client/public/imagens/LEIA-ME.md. Enquanto o caminho estiver vazio,
// a página desenha uma cena de estrada em SVG (leve, nítida em qualquer tela)
// no lugar, então nada quebra e nada carrega em vão.
export type Foto = {
  src: string;
  /** Ex.: "/imagens/hero-estrada-800.webp 800w, /imagens/hero-estrada-1600.webp 1600w" */
  srcSet?: string;
  sizes?: string;
  alt: string;
};

export const FOTOS: Record<"hero" | "prevencao", Foto> = {
  hero: {
    src: "",
    srcSet: "",
    sizes: "100vw",
    alt: "Picape da Rede Vias com adesivagem da marca rodando em uma estrada de serra",
  },
  prevencao: {
    src: "",
    srcSet: "",
    sizes: "(min-width: 1024px) 50vw, 100vw",
    alt: "Motorista parada no acostamento com o triângulo de segurança ao lado do carro",
  },
};
