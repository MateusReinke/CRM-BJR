import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Trash2, Tag, Truck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useStore } from "@/contexts/store-context";
import { useAuth } from "@/hooks/use-auth";
import { canManageFinancial } from "@/lib/permissions";
import type { FinancialTransaction, InsertFinancialTransaction, FinancialCategory, InsertFinancialCategory, Supplier, InsertSupplier, Client } from "@shared/schema";

const paymentMethodLabels: Record<string, string> = {
  pix: "PIX",
  card: "Cartão",
  cash: "Dinheiro",
  bank_slip: "Boleto",
};

export default function Financial() {
  const { stores, selectedStoreId, setSelectedStoreId, getStoreName, getStoreColor } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canManage = canManageFinancial(user);

  const [open, setOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const [formData, setFormData] = useState<InsertFinancialTransaction>({
    type: "expense",
    storeId: "",
    categoryId: "",
    supplierId: "",
    clientId: "",
    description: "",
    amount: "0.00",
    paymentMethod: "pix",
    transactionDate: new Date(),
    dueDate: null,
    paidDate: null,
    serviceOrderId: null,
    invoiceId: null,
  });
  const [categoryForm, setCategoryForm] = useState<InsertFinancialCategory>({ name: "", type: "expense", isActive: true });
  const [supplierForm, setSupplierForm] = useState<InsertSupplier>({ name: "", cpfCnpj: "", phone: "", email: "", address: "", observations: "", isActive: true });

  const { data: transactions = [], isLoading } = useQuery<FinancialTransaction[]>({
    queryKey: ["/api/financial", { storeId: selectedStoreId }],
    enabled: canManage,
  });

  const { data: categories = [] } = useQuery<FinancialCategory[]>({
    queryKey: ["/api/financial-categories"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients", { storeId: selectedStoreId }],
  });

  const { data: byStore = [] } = useQuery<{ storeId: string; total: number }[]>({
    queryKey: ["/api/financial/by-store", selectedMonth],
    enabled: canManage,
  });

  const categoriesById = new Map(categories.map(c => [c.id, c]));
  const suppliersById = new Map(suppliers.map(s => [s.id, s]));
  const clientsById = new Map(clients.map(c => [c.id, c]));

  const createTransactionMutation = useMutation({
    mutationFn: async (data: InsertFinancialTransaction) => {
      const res = await apiRequest("POST", "/api/financial", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/by-store"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      setOpen(false);
      resetForm();
      toast({ title: "Movimentação registrada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao registrar movimentação", description: error.message, variant: "destructive" });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/financial/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/by-store"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({ title: "Movimentação excluída com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir movimentação", description: error.message, variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertFinancialCategory) => {
      const res = await apiRequest("POST", "/api/financial-categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-categories"] });
      setCategoryDialogOpen(false);
      setCategoryForm({ name: "", type: "expense", isActive: true });
      toast({ title: "Categoria criada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar categoria", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/financial-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-categories"] });
      toast({ title: "Categoria removida!" });
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      const res = await apiRequest("POST", "/api/suppliers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setSupplierDialogOpen(false);
      setSupplierForm({ name: "", cpfCnpj: "", phone: "", email: "", address: "", observations: "", isActive: true });
      toast({ title: "Fornecedor criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar fornecedor", description: error.message, variant: "destructive" });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({ title: "Fornecedor removido!" });
    },
  });

  const resetForm = () => {
    setFormData({
      type: "expense",
      storeId: selectedStoreId !== 'all' ? selectedStoreId : (stores[0]?.id || ""),
      categoryId: "",
      supplierId: "",
      clientId: "",
      description: "",
      amount: "0.00",
      paymentMethod: "pix",
      transactionDate: new Date(),
      dueDate: null,
      paidDate: null,
      serviceOrderId: null,
      invoiceId: null,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      categoryId: formData.categoryId || null,
      supplierId: formData.type === 'expense' ? (formData.supplierId || null) : null,
      clientId: formData.type === 'income' ? (formData.clientId || null) : null,
    };
    createTransactionMutation.mutate(payload);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const netProfit = totalIncome - totalExpenses;

  const filteredCategories = categories.filter(c => c.type === formData.type);

  if (!canManage) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Você não tem permissão para ver despesas e receitas.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Despesas e Receitas</h1>
            <p className="text-muted-foreground">Controle financeiro por loja</p>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-48"
            />

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

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Movimentação</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value, categoryId: "" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="income">Receita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Loja</Label>
                      <Select value={formData.storeId} onValueChange={(value) => setFormData({ ...formData, storeId: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={formData.type === 'expense' ? "Ex: Conta de energia - Agosto" : "Ex: Recebimento OS #123"}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={formData.categoryId || ""} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {filteredCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {formData.type === 'expense' ? (
                      <div className="space-y-2">
                        <Label>Fornecedor</Label>
                        <Select value={formData.supplierId || ""} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
                          <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                          <SelectContent>
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Cliente</Label>
                        <Select value={formData.clientId || ""} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                          <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                          <SelectContent>
                            {clients.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Forma de Pagamento</Label>
                      <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="card">Cartão</SelectItem>
                          <SelectItem value="cash">Dinheiro</SelectItem>
                          <SelectItem value="bank_slip">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={new Date(formData.transactionDate as any).toISOString().slice(0, 10)}
                      onChange={(e) => setFormData({ ...formData, transactionDate: new Date(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={createTransactionMutation.isPending}>Registrar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="movimentacoes">
          <TabsList>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
            <TabsTrigger value="por-loja">Comparativo por Loja</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          </TabsList>

          <TabsContent value="movimentacoes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Receitas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesas</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {netProfit.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Movimentação Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhuma movimentação financeira encontrada</div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <Card key={transaction.id} className="border-l-4" style={{ borderLeftColor: getStoreColor(transaction.storeId) }}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-foreground">{transaction.description}</h3>
                                <Badge className={transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}>
                                  {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                                </Badge>
                                <Badge variant="outline" style={{ backgroundColor: getStoreColor(transaction.storeId), color: 'white' }}>
                                  {getStoreName(transaction.storeId)}
                                </Badge>
                                {transaction.categoryId && categoriesById.get(transaction.categoryId) && (
                                  <Badge variant="secondary">{categoriesById.get(transaction.categoryId)!.name}</Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(transaction.transactionDate).toLocaleDateString('pt-BR')}
                                </div>
                                <div>{paymentMethodLabels[transaction.paymentMethod]}</div>
                                {transaction.supplierId && suppliersById.get(transaction.supplierId) && (
                                  <div><span className="font-medium">Fornecedor:</span> {suppliersById.get(transaction.supplierId)!.name}</div>
                                )}
                                {transaction.clientId && clientsById.get(transaction.clientId) && (
                                  <div><span className="font-medium">Cliente:</span> {clientsById.get(transaction.clientId)!.name}</div>
                                )}
                              </div>

                              <div className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'expense' ? '-' : '+'}R$ {parseFloat(transaction.amount).toFixed(2)}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => deleteTransactionMutation.mutate(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="por-loja">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Loja - {selectedMonth}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {byStore.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhuma despesa registrada neste mês</div>
                ) : (
                  (() => {
                    const maxTotal = Math.max(...byStore.map(s => s.total), 1);
                    return byStore.map((entry) => (
                      <div key={entry.storeId}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStoreColor(entry.storeId) }} />
                            <span className="text-sm font-medium text-foreground">{getStoreName(entry.storeId)}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">R$ {entry.total.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${(entry.total / maxTotal) * 100}%`, backgroundColor: getStoreColor(entry.storeId) }} />
                        </div>
                      </div>
                    ));
                  })()
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorias">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Categorias Financeiras</CardTitle>
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="mr-2 h-4 w-4" />Nova Categoria</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); createCategoryMutation.mutate(categoryForm); }} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={categoryForm.type} onValueChange={(value: any) => setCategoryForm({ ...categoryForm, type: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Despesa</SelectItem>
                            <SelectItem value="income">Receita</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={createCategoryMutation.isPending}>Criar</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhuma categoria cadastrada</div>
                ) : categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span>{cat.name}</span>
                      <Badge variant={cat.type === 'income' ? 'default' : 'secondary'}>{cat.type === 'income' ? 'Receita' : 'Despesa'}</Badge>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteCategoryMutation.mutate(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fornecedores">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fornecedores</CardTitle>
                <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="mr-2 h-4 w-4" />Novo Fornecedor</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Novo Fornecedor</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); createSupplierMutation.mutate(supplierForm); }} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>CPF/CNPJ</Label>
                          <Input value={supplierForm.cpfCnpj || ""} onChange={(e) => setSupplierForm({ ...supplierForm, cpfCnpj: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <Input value={supplierForm.phone || ""} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setSupplierDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={createSupplierMutation.isPending}>Criar</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-2">
                {suppliers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum fornecedor cadastrado</div>
                ) : suppliers.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>{s.name}</span>
                      {s.phone && <span className="text-sm text-muted-foreground">{s.phone}</span>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteSupplierMutation.mutate(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
