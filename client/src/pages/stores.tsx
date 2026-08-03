import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Edit, Store as StoreIcon, Power, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { canManageStores } from "@/lib/permissions";
import type { Store, InsertStore } from "@shared/schema";

const emptyForm: InsertStore = {
  code: "",
  name: "",
  color: "#2563eb",
  isActive: true,
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  phone: "",
  email: "",
  cnpj: "",
  razaoSocial: "",
  nomeFantasia: "",
  inscricaoEstadual: "",
  inscricaoMunicipal: "",
  taxRegime: "simples_nacional",
  nfeProvider: "simulado",
  nfeEnvironment: "homologacao",
  nfeApiKeyEncrypted: "",
  nfseSeries: "1",
  nfeSeries: "1",
  issRate: "5.00",
};

const taxRegimeLabels: Record<string, string> = {
  simples_nacional: "Simples Nacional",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
  mei: "MEI",
};

const providerLabels: Record<string, string> = {
  simulado: "Simulado (sem transmissão real)",
  focus_nfe: "Focus NFe",
  plugnotas: "PlugNotas",
  enotas: "eNotas",
  nfeio: "NFE.io",
};

export default function Stores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState<InsertStore>(emptyForm);

  if (!canManageStores(user)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Você não tem permissão para gerenciar lojas.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  const { data: stores = [], isLoading } = useQuery<Store[]>({
    queryKey: ["/api/stores", { includeInactive: "true" }],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertStore) => {
      const res = await apiRequest("POST", "/api/stores", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setOpen(false);
      setFormData(emptyForm);
      toast({ title: "Loja criada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar loja", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertStore> }) => {
      const res = await apiRequest("PUT", `/api/stores/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setOpen(false);
      setEditingStore(null);
      setFormData(emptyForm);
      toast({ title: "Loja atualizada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar loja", description: error.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/stores/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({ title: "Status da loja atualizado!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStore) {
      updateMutation.mutate({ id: editingStore.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({ ...store });
    setOpen(true);
  };

  const handleNew = () => {
    setEditingStore(null);
    setFormData(emptyForm);
    setOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lojas</h1>
            <p className="text-muted-foreground">Gerencie as lojas do grupo e os dados fiscais de cada uma</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Loja
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingStore ? "Editar Loja" : "Nova Loja"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Identificação</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Código</Label>
                      <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="SP1" required />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Nome</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="São Paulo - Matriz" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Cor (identificação visual)</Label>
                      <Input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Endereço</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input value={formData.cep || ""} onChange={(e) => setFormData({ ...formData, cep: e.target.value })} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Logradouro</Label>
                      <Input value={formData.logradouro || ""} onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Número</Label>
                      <Input value={formData.numero || ""} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Bairro</Label>
                      <Input value={formData.bairro || ""} onChange={(e) => setFormData({ ...formData, bairro: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input value={formData.cidade || ""} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>UF</Label>
                      <Input value={formData.uf || ""} onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })} maxLength={2} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Dados Fiscais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CNPJ</Label>
                      <Input value={formData.cnpj || ""} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Regime Tributário</Label>
                      <Select value={formData.taxRegime} onValueChange={(value: any) => setFormData({ ...formData, taxRegime: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(taxRegimeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Razão Social</Label>
                      <Input value={formData.razaoSocial || ""} onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome Fantasia</Label>
                      <Input value={formData.nomeFantasia || ""} onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Inscrição Estadual (necessária para NF-e/NFC-e)</Label>
                      <Input value={formData.inscricaoEstadual || ""} onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Inscrição Municipal (necessária para NFS-e)</Label>
                      <Input value={formData.inscricaoMunicipal || ""} onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Emissão de Nota Fiscal</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Provedor</Label>
                      <Select value={formData.nfeProvider} onValueChange={(value: any) => setFormData({ ...formData, nfeProvider: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(providerLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.nfeProvider !== 'simulado' && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Este provedor ainda não está integrado neste projeto - a emissão retornará erro até um adaptador real ser implementado (ver server/nfe/README.md).
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Ambiente</Label>
                      <Select value={formData.nfeEnvironment} onValueChange={(value: any) => setFormData({ ...formData, nfeEnvironment: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="homologacao">Homologação (testes)</SelectItem>
                          <SelectItem value="producao">Produção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Série NFS-e</Label>
                      <Input value={formData.nfseSeries} onChange={(e) => setFormData({ ...formData, nfseSeries: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Série NF-e/NFC-e</Label>
                      <Input value={formData.nfeSeries} onChange={(e) => setFormData({ ...formData, nfeSeries: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Alíquota ISS estimada (%)</Label>
                      <Input type="number" step="0.01" value={formData.issRate} onChange={(e) => setFormData({ ...formData, issRate: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label>Chave de API do provedor (armazenada criptografada)</Label>
                    <Input
                      type="password"
                      value={formData.nfeApiKeyEncrypted || ""}
                      onChange={(e) => setFormData({ ...formData, nfeApiKeyEncrypted: e.target.value })}
                      placeholder="Preencha somente ao integrar um provedor real"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingStore ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lojas do Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : stores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhuma loja cadastrada</div>
            ) : (
              <div className="grid gap-4">
                {stores.map((store) => (
                  <Card key={store.id} className="border-l-4" style={{ borderLeftColor: store.color }}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <StoreIcon className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">{store.name}</h3>
                            <Badge variant="outline">{store.code}</Badge>
                            {!store.isActive && <Badge variant="destructive">Inativa</Badge>}
                            <Badge variant="secondary">{providerLabels[store.nfeProvider]}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div><span className="font-medium">CNPJ:</span> {store.cnpj || "não cadastrado"}</div>
                            <div><span className="font-medium">Cidade:</span> {store.cidade ? `${store.cidade}/${store.uf}` : "não cadastrada"}</div>
                            <div><span className="font-medium">Regime:</span> {taxRegimeLabels[store.taxRegime]}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(store)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActiveMutation.mutate({ id: store.id, isActive: !store.isActive })}
                            className={store.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
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
    </Layout>
  );
}
