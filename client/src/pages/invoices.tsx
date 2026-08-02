import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Trash2, Receipt, Send, Ban, Printer, AlertCircle, AlertTriangle } from "lucide-react";
import { apiRequest, apiRequestData } from "@/lib/queryClient";
import { useStore } from "@/contexts/store-context";
import { canManageInvoices } from "@/lib/permissions";
import type { Invoice, InvoiceItem, Store, Client, ServiceOrder, CreateInvoiceInput } from "@shared/schema";

type InvoiceWithRelations = Invoice & { items: InvoiceItem[]; store: Store; client: Client };

const typeLabels: Record<string, string> = {
  nfse: "NFS-e (Serviço)",
  nfe: "NF-e (Produto)",
  nfce: "NFC-e (Consumidor)",
};

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  processing: "Processando",
  issued: "Emitida",
  cancelled: "Cancelada",
  error: "Erro",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  issued: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-500 line-through",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

interface ItemDraft {
  description: string;
  quantity: string;
  unitPrice: string;
  ncm?: string;
  cfop?: string;
}

const emptyItem: ItemDraft = { description: "", quantity: "1", unitPrice: "0.00" };

export default function Invoices() {
  const { stores, selectedStoreId, setSelectedStoreId, getStoreName, getStoreColor } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceWithRelations | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [invoiceType, setInvoiceType] = useState<'nfse' | 'nfe' | 'nfce'>('nfse');
  const [storeId, setStoreId] = useState("");
  const [clientId, setClientId] = useState("");
  const [serviceOrderId, setServiceOrderId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("0.00");
  const [items, setItems] = useState<ItemDraft[]>([{ ...emptyItem }]);

  const canManage = canManageInvoices(user);

  const { data: invoices = [], isLoading } = useQuery<InvoiceWithRelations[]>({
    queryKey: ["/api/invoices", { storeId: selectedStoreId }],
    enabled: canManage,
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients", { storeId: storeId || selectedStoreId }],
  });

  // Prefills a draft from ?fromServiceOrder=<id>, set by the "Emitir Nota
  // Fiscal" action on a completed Service Order.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromServiceOrder = params.get('fromServiceOrder');
    if (!fromServiceOrder) return;

    (async () => {
      try {
        const order = await apiRequestData<ServiceOrder>("GET", `/api/service-orders/${fromServiceOrder}`);
        setInvoiceType('nfse');
        setStoreId(order.storeId);
        setClientId(order.clientId);
        setServiceOrderId(order.id);
        setDescription(`Serviços referentes à OS #${order.osNumber}: ${order.services}`.slice(0, 500));
        setItems([{ description: `Mão de obra - OS #${order.osNumber}`, quantity: "1", unitPrice: order.totalValue }]);
        setOpen(true);
        window.history.replaceState(null, "", "/invoices");
      } catch {
        toast({ title: "Não foi possível carregar a ordem de serviço", variant: "destructive" });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data: CreateInvoiceInput) => {
      return await apiRequestData<InvoiceWithRelations>("POST", "/api/invoices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      resetForm();
      setOpen(false);
      toast({ title: "Rascunho de nota fiscal criado!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar nota fiscal", description: error.message, variant: "destructive" });
    },
  });

  const issueMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequestData<InvoiceWithRelations>("POST", `/api/invoices/${id}/issue`);
    },
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({ title: invoice.status === 'issued' ? "Nota fiscal emitida!" : "Nota fiscal em processamento" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao emitir nota fiscal", description: error.message, variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiRequestData<InvoiceWithRelations>("POST", `/api/invoices/${id}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      setCancellingId(null);
      setCancelReason("");
      toast({ title: "Nota fiscal cancelada" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao cancelar nota fiscal", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setInvoiceType('nfse');
    setStoreId(selectedStoreId !== 'all' ? selectedStoreId : (stores[0]?.id || ""));
    setClientId("");
    setServiceOrderId(undefined);
    setDescription("");
    setDiscount("0.00");
    setItems([{ ...emptyItem }]);
  };

  const updateItem = (index: number, patch: Partial<ItemDraft>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      storeId,
      type: invoiceType,
      clientId,
      serviceOrderId,
      description,
      discount,
      items: items
        .filter((it) => it.description.trim())
        .map((it) => ({ description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, ncm: it.ncm, cfop: it.cfop })),
    });
  };

  if (!canManage) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Você não tem permissão para emitir notas fiscais.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notas Fiscais</h1>
            <p className="text-muted-foreground">Emita e acompanhe as notas fiscais das lojas</p>
          </div>

          <div className="flex gap-4 items-center">
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌐 Todas as Lojas</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && !serviceOrderId) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Nota Fiscal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Nota Fiscal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={invoiceType} onValueChange={(v: any) => setInvoiceType(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nfse">NFS-e (Serviço)</SelectItem>
                          <SelectItem value="nfe">NF-e (Produto)</SelectItem>
                          <SelectItem value="nfce">NFC-e (Consumidor)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Loja</Label>
                      <Select value={storeId} onValueChange={setStoreId}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cliente</Label>
                      <Select value={clientId} onValueChange={setClientId}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição / Discriminação</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} required />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Itens</Label>
                      <Button type="button" size="sm" variant="outline" onClick={() => setItems([...items, { ...emptyItem }])}>
                        <Plus className="h-3 w-3 mr-1" /> Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <Input
                            className="col-span-6"
                            placeholder="Descrição do item"
                            value={item.description}
                            onChange={(e) => updateItem(index, { description: e.target.value })}
                          />
                          <Input
                            className="col-span-2"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Qtd"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, { quantity: e.target.value })}
                          />
                          <Input
                            className="col-span-3"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Valor unit."
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="col-span-1"
                            onClick={() => setItems(items.filter((_, i) => i !== index))}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Desconto (R$)</Label>
                      <Input type="number" step="0.01" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="text-sm text-muted-foreground">Subtotal: R$ {subtotal.toFixed(2)}</div>
                      <div className="text-xl font-bold">Total: R$ {total.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={createMutation.isPending || !storeId || !clientId}>
                      Salvar Rascunho
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notas Fiscais</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhuma nota fiscal encontrada</div>
            ) : (
              <div className="grid gap-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="border-l-4" style={{ borderLeftColor: getStoreColor(invoice.storeId) }}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1 min-w-[240px]">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <Receipt className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">
                              {typeLabels[invoice.type]} {invoice.number ? `#${invoice.series}-${invoice.number}` : "(rascunho)"}
                            </h3>
                            <Badge className={statusColors[invoice.status]}>{statusLabels[invoice.status]}</Badge>
                            <Badge variant="outline" style={{ backgroundColor: getStoreColor(invoice.storeId), color: 'white' }}>
                              {getStoreName(invoice.storeId)}
                            </Badge>
                            {invoice.provider === 'simulado' && (
                              <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">Simulada</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">{invoice.description}</div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Cliente:</span> {invoice.client?.name}
                          </div>
                          {invoice.status === 'error' && invoice.errorMessage && (
                            <div className="text-sm text-red-600 mt-1">{invoice.errorMessage}</div>
                          )}
                          <div className="text-lg font-bold mt-2">R$ {parseFloat(invoice.totalAmount).toFixed(2)}</div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setViewingInvoice(invoice)}>
                            <Printer className="h-4 w-4" />
                          </Button>
                          {(invoice.status === 'draft' || invoice.status === 'error') && (
                            <Button size="sm" onClick={() => issueMutation.mutate(invoice.id)} disabled={issueMutation.isPending}>
                              <Send className="h-4 w-4 mr-1" /> Emitir
                            </Button>
                          )}
                          {invoice.status === 'issued' && (
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => setCancellingId(invoice.id)}>
                              <Ban className="h-4 w-4 mr-1" /> Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel dialog */}
      <Dialog open={!!cancellingId} onOpenChange={(v) => !v && setCancellingId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancelar Nota Fiscal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo do cancelamento</Label>
              <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCancellingId(null)}>Voltar</Button>
              <Button
                variant="destructive"
                disabled={!cancelReason.trim() || cancelMutation.isPending}
                onClick={() => cancellingId && cancelMutation.mutate({ id: cancellingId, reason: cancelReason })}
              >
                Confirmar Cancelamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print / detail view */}
      <Dialog open={!!viewingInvoice} onOpenChange={(v) => !v && setViewingInvoice(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewingInvoice && (
            <div className="invoice-print-area space-y-4 p-2">
              {viewingInvoice.provider === 'simulado' && (
                <Alert variant="destructive" className="no-print">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Documento simulado</AlertTitle>
                  <AlertDescription>
                    Esta loja está usando o emissor simulado - este documento NÃO foi transmitido à Prefeitura/SEFAZ e não tem valor fiscal.
                  </AlertDescription>
                </Alert>
              )}
              <div className="text-center border-b pb-4">
                {viewingInvoice.provider === 'simulado' && (
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                    Documento simulado - sem valor fiscal
                  </p>
                )}
                <h2 className="text-xl font-bold">{viewingInvoice.store?.razaoSocial || viewingInvoice.store?.name}</h2>
                {viewingInvoice.store?.cnpj && <p className="text-sm text-muted-foreground">CNPJ: {viewingInvoice.store.cnpj}</p>}
                <p className="text-sm text-muted-foreground">
                  {typeLabels[viewingInvoice.type]} - Série {viewingInvoice.series || '-'} Nº {viewingInvoice.number ?? '-'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Destinatário</p>
                  <p>{viewingInvoice.client?.name}</p>
                  <p className="text-muted-foreground">{viewingInvoice.client?.cpfCnpj}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <p>{statusLabels[viewingInvoice.status]}</p>
                  {viewingInvoice.issueDate && <p className="text-muted-foreground">Emitida em {new Date(viewingInvoice.issueDate).toLocaleString('pt-BR')}</p>}
                  {viewingInvoice.accessKey && <p className="text-xs text-muted-foreground break-all">Chave: {viewingInvoice.accessKey}</p>}
                </div>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Discriminação</p>
                <p className="text-sm text-muted-foreground">{viewingInvoice.description}</p>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-right">Qtd</th>
                    <th className="py-1 text-right">Vl. Unit.</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-1">{item.description}</td>
                      <td className="py-1 text-right">{item.quantity}</td>
                      <td className="py-1 text-right">R$ {parseFloat(item.unitPrice).toFixed(2)}</td>
                      <td className="py-1 text-right">R$ {parseFloat(item.totalPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right space-y-1 text-sm">
                <p>Subtotal: R$ {parseFloat(viewingInvoice.itemsSubtotal).toFixed(2)}</p>
                <p>Desconto: R$ {parseFloat(viewingInvoice.discount).toFixed(2)}</p>
                <p className="text-lg font-bold">Total: R$ {parseFloat(viewingInvoice.totalAmount).toFixed(2)}</p>
              </div>

              <div className="flex justify-end no-print pt-2">
                <Button onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" /> Imprimir / Salvar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
