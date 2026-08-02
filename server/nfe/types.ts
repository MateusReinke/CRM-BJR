import type { Invoice, InvoiceItem, Store, Client } from "@shared/schema";

export interface IssueInvoiceContext {
  invoice: Invoice;
  items: InvoiceItem[];
  store: Store;
  client: Client;
}

export interface IssueInvoiceResult {
  status: 'issued' | 'processing' | 'error';
  accessKey?: string;
  externalId?: string;
  errorMessage?: string;
}

export interface CancelInvoiceResult {
  status: 'cancelled' | 'error';
  errorMessage?: string;
}

// Implemented by each nota fiscal issuer (a local simulator, or a real
// provider such as Focus NFe / PlugNotas / eNotas / NFE.io). Callers only
// depend on this interface, so a real provider can be dropped in later
// without touching the rest of the invoicing flow.
export interface NFeProvider {
  readonly name: string;
  issueInvoice(ctx: IssueInvoiceContext): Promise<IssueInvoiceResult>;
  cancelInvoice(ctx: IssueInvoiceContext, reason: string): Promise<CancelInvoiceResult>;
}
