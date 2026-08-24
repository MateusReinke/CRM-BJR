// Conteúdo tipado da página institucional (landing). Nada de texto solto em
// JSX — toda cópia da vitrine pública vive aqui. Onde o dado real ainda não
// existe, o valor É o literal "TODO: ..." — isso é intencional: o texto
// aparece assim na tela até alguém substituir, em vez de publicar um
// placeholder que parece dado real (o problema que motivou este redesign).
//
// Duas decisões de integridade de conteúdo, deliberadas:
// 1. `promocoes` e `depoimentos` começam vazios. Não existem promoções nem
//    avaliações reais para publicar agora, e inventar preço/desconto ou
//    depoimento de cliente fictício seria pior que os placeholders que
//    este redesign está removendo. Os componentes tratam o estado vazio
//    como estado de produção, não como caso extremo.
// 2. `seguradoras` e `especialidade` de cada unidade também ficam como
//    TODO — são afirmações factuais sobre o negócio que eu não tenho como
//    confirmar.

export type CodigoUnidade = "SP1" | "SP2" | "SOR";

export interface FaixaHorario {
  abertura: string; // "HH:MM", 24h
  fechamento: string; // "HH:MM", 24h
}

export interface HorarioSemanal {
  segSex: FaixaHorario;
  sabado: FaixaHorario | null; // null = fechado
  domingo: FaixaHorario | null;
}

export interface Unidade {
  codigo: CodigoUnidade;
  nome: string;
  tipo: "matriz" | "filial";
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  // Aproximadas por bairro/cidade até o endereço real (acima) ser
  // confirmado — servem só para o cálculo de "unidade mais próxima".
  // Atualizar junto com o endereço real.
  lat: number;
  lng: number;
  telefone: string;
  whatsapp: string; // único número por unidade — fonte única, sem duplicidade
  horario: HorarioSemanal;
  especialidade: string;
  fotoUrl: string | null;
  mapaEmbedUrl: string | null;
}

export interface ItemServico {
  categoria: string;
  slug: string;
  descricao: string;
  itens: string[];
  precoDesde: number | null; // null = "sob avaliação", nunca um preço inventado
}

export interface Promocao {
  id: string;
  titulo: string;
  inclui: string[];
  precoDe: number | null;
  precoPor: number | null;
  descontoPercentual: number | null;
  validade: string; // "DD/MM/AAAA"
  unidades: CodigoUnidade[];
  condicoes: string;
}

export interface Depoimento {
  id: string;
  nome: string;
  unidade: CodigoUnidade;
  categoria: string; // ecoa o slug de ItemServico
  texto: string;
  nota: number; // 1-5
  data: string;
}

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export interface Seguradora {
  nome: string;
  desde: string | null;
}

export const empresa = {
  nome: "BJR Centro Automotivo",
  cnpj: "TODO: CNPJ real (formato 00.000.000/0000-00)",
  telefoneCentral: "TODO: telefone central (formato (11) 0000-0000)",
  email: "TODO: e-mail de contato real",
  instagram: "TODO: @perfil do Instagram",
  facebook: "TODO: /pagina do Facebook",
  garantiaDias: 90,
  garantiaKm: 3000,
  lgpdTexto:
    "TODO: texto de aviso LGPD revisado pelo jurídico do cliente (uso do formulário de orçamento, retenção de dados, contato).",
};

export const unidades: Unidade[] = [
  {
    codigo: "SP1",
    nome: "São Paulo SP1",
    tipo: "matriz",
    endereco: "TODO: endereço completo da unidade SP1",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    uf: "SP",
    cep: "TODO: CEP",
    lat: -23.557,
    lng: -46.652,
    telefone: "TODO: telefone fixo SP1",
    whatsapp: "TODO: WhatsApp SP1",
    horario: {
      segSex: { abertura: "07:00", fechamento: "18:00" },
      sabado: { abertura: "07:00", fechamento: "12:00" },
      domingo: null,
    },
    especialidade: "TODO: especialidade real desta unidade (ex.: funilaria, sinistro de seguradora)",
    fotoUrl: null,
    mapaEmbedUrl: null,
  },
  {
    codigo: "SP2",
    nome: "São Paulo SP2",
    tipo: "filial",
    endereco: "TODO: endereço completo da unidade SP2",
    bairro: "Vila Mariana",
    cidade: "São Paulo",
    uf: "SP",
    cep: "TODO: CEP",
    lat: -23.589,
    lng: -46.635,
    telefone: "TODO: telefone fixo SP2",
    whatsapp: "TODO: WhatsApp SP2",
    horario: {
      segSex: { abertura: "07:00", fechamento: "18:00" },
      sabado: { abertura: "07:00", fechamento: "12:00" },
      domingo: null,
    },
    especialidade: "TODO: especialidade real desta unidade (ex.: atendimento expresso)",
    fotoUrl: null,
    mapaEmbedUrl: null,
  },
  {
    codigo: "SOR",
    nome: "Sorocaba SOR",
    tipo: "filial",
    endereco: "TODO: endereço completo da unidade SOR",
    bairro: "Centro",
    cidade: "Sorocaba",
    uf: "SP",
    cep: "TODO: CEP",
    lat: -23.5015,
    lng: -47.4526,
    telefone: "TODO: telefone fixo SOR",
    whatsapp: "TODO: WhatsApp SOR",
    horario: {
      segSex: { abertura: "07:00", fechamento: "18:00" },
      sabado: { abertura: "07:00", fechamento: "12:00" },
      domingo: null,
    },
    especialidade: "TODO: especialidade real desta unidade (ex.: atendimento a frotas)",
    fotoUrl: null,
    mapaEmbedUrl: null,
  },
];

export const servicos: ItemServico[] = [
  {
    categoria: "Manutenção Preventiva",
    slug: "manutencao",
    descricao: "Revisão programada para o carro não te surpreender na estrada.",
    itens: ["Troca de óleo e filtros", "Revisão de fluidos", "Checagem de correias e velas", "Revisão do sistema elétrico básico"],
    precoDesde: null,
  },
  {
    categoria: "Freios e Segurança",
    slug: "freios",
    descricao: "Diagnóstico de ruído e resposta de pedal, sem enrolação.",
    itens: ["Troca de pastilhas e discos", "Sangria do sistema hidráulico", "Reparo de cilindros e pinças", "Checagem do freio de estacionamento"],
    precoDesde: null,
  },
  {
    categoria: "Suspensão e Direção",
    slug: "suspensao",
    descricao: "Do barulho na lombada ao carro puxando pro lado.",
    itens: ["Alinhamento e balanceamento", "Troca de amortecedores", "Buchas e terminais de direção", "Geometria 3D"],
    precoDesde: null,
  },
  {
    categoria: "Elétrica",
    slug: "eletrica",
    descricao: "Da bateria que não segura carga ao painel acendendo luz errada.",
    itens: ["Diagnóstico de bateria e alternador", "Reparo de chicote e módulos", "Iluminação e sinalização", "Sistemas de partida"],
    precoDesde: null,
  },
  {
    categoria: "Ar-condicionado",
    slug: "ar-condicionado",
    descricao: "Do ar que só sopra quente à higienização anual.",
    itens: ["Recarga de gás", "Higienização do sistema", "Troca de filtro de cabine", "Diagnóstico de compressor"],
    precoDesde: null,
  },
  {
    categoria: "Pneus e Alinhamento",
    slug: "pneus",
    descricao: "Desgaste irregular, calibragem e rodízio.",
    itens: ["Alinhamento e balanceamento", "Rodízio e calibragem", "Avaliação de desgaste", "Troca de pneus"],
    precoDesde: null,
  },
  {
    categoria: "Diagnóstico Eletrônico",
    slug: "diagnostico",
    descricao: "Leitura de central para a luz da injeção que acendeu sem avisar.",
    itens: ["Scanner de central eletrônica", "Leitura e apagamento de falhas", "Teste de sensores", "Relatório técnico do diagnóstico"],
    precoDesde: null,
  },
  {
    categoria: "Sinistro e Seguradora",
    slug: "sinistro",
    descricao: "Acionamento de seguro com laudo e ordem de serviço documentados.",
    itens: ["Orçamento para seguradora", "Acompanhamento do sinistro", "Funilaria e pintura", "Documentação para a apólice"],
    precoDesde: null,
  },
];

// Sem promoções reais cadastradas ainda — o componente renderiza o estado
// vazio ("Sem promoções ativas — avise-me quando houver"). Assim que o
// cliente confirmar preço, validade e unidades participantes, populam
// aqui e o carrossel horizontal passa a renderizar de verdade.
export const promocoes: Promocao[] = [];

// Sem avaliações reais importadas ainda. O componente renderiza o estado
// vazio com um aviso — trocar por avaliações reais do Google (nome,
// unidade, serviço realizado) antes de publicar.
export const depoimentos: Depoimento[] = [];

export const faq: FaqItem[] = [
  {
    pergunta: "Qual o prazo para receber um orçamento?",
    resposta:
      "Para a maioria dos casos, o orçamento sai na mesma hora, direto no diagnóstico. Quando depende de peça ou de análise mais longa, o prazo é de até 24 horas úteis.",
  },
  {
    pergunta: "Vocês atendem sinistro de seguradora?",
    resposta:
      "Sim — somos credenciados por seguradoras (lista completa na seção de credenciamento). Levamos o carro, abrimos o laudo e acompanhamos o processo com a seguradora até a aprovação.",
  },
  {
    pergunta: "A garantia vale nas 3 unidades?",
    resposta: `Sim. A garantia de ${empresa.garantiaDias} dias ou ${empresa.garantiaKm.toLocaleString(
      "pt-BR",
    )} km — o que vencer primeiro — vale em qualquer uma das três unidades, não só na que fez o serviço.`,
  },
  {
    pergunta: "Preciso agendar ou posso chegar direto?",
    resposta:
      "Dá para chegar direto, mas o WhatsApp da unidade mais próxima resolve mais rápido: você já descreve o problema e chega com horário reservado.",
  },
  {
    pergunta: "TODO: pergunta real de atendimento (ex.: peças originais x paralelas, prazo médio de reparo por categoria)",
    resposta: "TODO: resposta real — substituir antes de publicar.",
  },
];

export const credenciamento: { seguradoras: Seguradora[] } = {
  seguradoras: [
    { nome: "TODO: nome da seguradora credenciada", desde: "TODO" },
    { nome: "TODO: nome da seguradora credenciada", desde: "TODO" },
    { nome: "TODO: nome da seguradora credenciada", desde: "TODO" },
  ],
};

export function unidadePorCodigo(codigo: CodigoUnidade): Unidade {
  const unidade = unidades.find((u) => u.codigo === codigo);
  if (!unidade) throw new Error(`Unidade desconhecida: ${codigo}`);
  return unidade;
}
