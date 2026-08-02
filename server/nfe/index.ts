import { AppError } from "../utils/errorHandler";
import { SimuladoNFeProvider } from "./simulado";
import type { NFeProvider } from "./types";

export type { NFeProvider, IssueInvoiceContext, IssueInvoiceResult, CancelInvoiceResult } from "./types";

const REAL_PROVIDER_HINTS: Record<string, string> = {
  focus_nfe: "Focus NFe (https://focusnfe.com.br) - REST API com token por CNPJ, ambiente de homologação gratuito.",
  plugnotas: "PlugNotas (https://plugnotas.com.br) - REST API multi-empresa.",
  enotas: "eNotas (https://enotasgw.com.br) - REST API, gerencia certificado digital para você.",
  nfeio: "NFE.io (https://nfe.io) - REST API focada em NFS-e por município.",
};

export function getNFeProvider(providerName: string): NFeProvider {
  if (providerName === 'simulado') {
    return new SimuladoNFeProvider();
  }

  const hint = REAL_PROVIDER_HINTS[providerName];
  if (hint) {
    throw new AppError(
      `A integração real com "${providerName}" ainda não foi implementada neste projeto. ` +
      `${hint} Configure a loja com o provedor "simulado" para continuar testando o fluxo, ` +
      `ou implemente um adaptador em server/nfe/${providerName}.ts que satisfaça a interface NFeProvider ` +
      `usando as credenciais reais da loja (certificado digital + conta no provedor).`,
      501
    );
  }

  throw new AppError(`Provedor de emissão de nota fiscal desconhecido: ${providerName}`, 400);
}
