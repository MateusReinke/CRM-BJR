import { randomBytes } from "crypto";
import type { NFeProvider, IssueInvoiceContext, IssueInvoiceResult, CancelInvoiceResult } from "./types";

// Local, non-transmitting issuer. It never talks to SEFAZ/Prefeitura or any
// third party - it only assigns a numbering-consistent, obviously-fake
// identifier so the rest of the app (numbering, PDF/print view, status
// tracking) can be built and used end-to-end before a store connects a real
// provider. Every document issued this way must be presented to the user as
// having no fiscal value.
export class SimuladoNFeProvider implements NFeProvider {
  readonly name = 'simulado';

  async issueInvoice({ invoice }: IssueInvoiceContext): Promise<IssueInvoiceResult> {
    const random = randomBytes(4).toString('hex').toUpperCase();
    const accessKey = `SIMULADO-${invoice.type.toUpperCase()}-${invoice.series}-${String(invoice.number).padStart(9, '0')}-${random}`;
    return {
      status: 'issued',
      accessKey,
      externalId: `SIM-${invoice.id}`,
    };
  }

  async cancelInvoice(): Promise<CancelInvoiceResult> {
    return { status: 'cancelled' };
  }
}
