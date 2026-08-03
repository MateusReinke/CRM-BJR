import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useStore } from "@/contexts/store-context";
import type { Inventory, InsertInventory } from "@shared/schema";

export default function InventoryPage() {
  const { stores, selectedStoreId, setSelectedStoreId, getStoreName, getStoreColor } = useStore();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [formData, setFormData] = useState<InsertInventory>({
    code: "",
    name: "",
    description: "",
    category: "",
    storeId: "",
    currentQuantity: 0,
    minimumQuantity: 0,
    costPrice: "0.00",
    salePrice: "0.00",
    ncm: "",
    supplier: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory", { storeId: selectedStoreId }],
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertInventory) => {
      const res = await apiRequest("POST", "/api/inventory", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      setOpen(false);
      resetForm();
      toast({ title: "Item criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar item", description: error.message, variant: "destructive" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertInventory> }) => {
      const res = await apiRequest("PUT", `/api/inventory/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      setOpen(false);
      resetForm();
      toast({ title: "Item atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar item", description: error.message, variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({ title: "Item excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir item", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      category: "",
      storeId: selectedStoreId !== 'all' ? selectedStoreId : (stores[0]?.id || ""),
      currentQuantity: 0,
      minimumQuantity: 0,
      costPrice: "0.00",
      salePrice: "0.00",
      ncm: "",
      supplier: "",
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createItemMutation.mutate(formData);
    }
  };

  const handleEdit = (item: Inventory) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || "",
      category: item.category,
      storeId: item.storeId,
      currentQuantity: item.currentQuantity,
      minimumQuantity: item.minimumQuantity,
      costPrice: item.costPrice.toString(),
      salePrice: item.salePrice.toString(),
      ncm: item.ncm || "",
      supplier: item.supplier || "",
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { status: 'out', color: 'text-red-600', icon: AlertTriangle };
    if (current <= minimum) return { status: 'low', color: 'text-yellow-600', icon: TrendingDown };
    return { status: 'ok', color: 'text-green-600', icon: TrendingUp };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
            <p className="text-muted-foreground">Gerencie o estoque de peças e produtos</p>
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

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Item
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Editar Item" : "Novo Item"}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="OIL-001"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Óleo Motor 5W30"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Lubrificantes"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storeId">Loja</Label>
                      <Select value={formData.storeId} onValueChange={(value) => setFormData({ ...formData, storeId: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentQuantity">Quantidade Atual</Label>
                      <Input
                        id="currentQuantity"
                        type="number"
                        value={formData.currentQuantity}
                        onChange={(e) => setFormData({ ...formData, currentQuantity: parseInt(e.target.value) || 0 })}
                        min="0"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minimumQuantity">Quantidade Mínima</Label>
                      <Input
                        id="minimumQuantity"
                        type="number"
                        value={formData.minimumQuantity}
                        onChange={(e) => setFormData({ ...formData, minimumQuantity: parseInt(e.target.value) || 0 })}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Preço Custo (R$)</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salePrice">Preço Venda (R$)</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Fornecedor</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier || ""}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        placeholder="Shell do Brasil"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ncm">NCM (para Nota Fiscal)</Label>
                      <Input
                        id="ncm"
                        value={formData.ncm || ""}
                        onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                        placeholder="2710.19.32"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Óleo sintético para motores"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createItemMutation.isPending || updateItemMutation.isPending}>
                      {editingItem ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Itens em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item encontrado
              </div>
            ) : (
              <div className="grid gap-4">
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(item.currentQuantity, item.minimumQuantity);
                  const StatusIcon = stockStatus.icon;

                  return (
                    <Card key={item.id} className="relative overflow-hidden border-l-4" style={{ borderLeftColor: getStoreColor(item.storeId) }}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Package className="h-5 w-5 text-muted-foreground" />
                              <h3 className="text-lg font-semibold text-foreground">
                                {item.name} ({item.code})
                              </h3>
                              <Badge variant="outline" style={{ backgroundColor: getStoreColor(item.storeId), color: 'white' }}>
                                {getStoreName(item.storeId)}
                              </Badge>
                              <div className={`flex items-center gap-1 ${stockStatus.color}`}>
                                <StatusIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  {item.currentQuantity} un.
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Categoria:</span>
                                {item.category}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Mín:</span>
                                {item.minimumQuantity} un.
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Custo:</span>
                                R$ {parseFloat(item.costPrice).toFixed(2)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Venda:</span>
                                R$ {parseFloat(item.salePrice).toFixed(2)}
                              </div>
                            </div>

                            {item.description && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                <span className="font-medium">Descrição:</span> {item.description}
                              </div>
                            )}

                            {item.supplier && (
                              <div className="mt-1 text-sm text-muted-foreground">
                                <span className="font-medium">Fornecedor:</span> {item.supplier}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
