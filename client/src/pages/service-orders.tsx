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
import { useAuth } from "@/hooks/use-auth";
import { Plus, Edit, Wrench, Car, User, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { canEditServiceOrder } from "@/lib/permissions";
import type { ServiceOrder, InsertServiceOrder, Client, Vehicle, User as UserType } from "@shared/schema";

export default function ServiceOrders() {
  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [formData, setFormData] = useState<InsertServiceOrder>({
    osNumber: "",
    clientId: "",
    vehicleId: "",
    mechanicId: "",
    services: "",
    totalValue: "0.00",
    status: "open",
    unit: "SP1",
    observations: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: serviceOrders = [], isLoading } = useQuery({
    queryKey: ["/api/service-orders/all"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients/all"],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles/all"],
  });

  const { data: mechanics = [] } = useQuery({
    queryKey: ["/api/employees/all/mechanic"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertServiceOrder) => {
      const res = await apiRequest("POST", "/api/service-orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      setOpen(false);
      resetForm();
      toast({ title: "Ordem de serviço criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar ordem de serviço", variant: "destructive" });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertServiceOrder> }) => {
      const res = await apiRequest("PUT", `/api/service-orders/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      setOpen(false);
      resetForm();
      toast({ title: "Ordem de serviço atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar ordem de serviço", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      osNumber: "",
      clientId: "",
      vehicleId: "",
      mechanicId: "",
      services: "",
      totalValue: "0.00",
      status: "open",
      unit: "SP1",
      observations: "",
    });
    setEditingOrder(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      updateOrderMutation.mutate({ id: editingOrder.id, data: formData });
    } else {
      createOrderMutation.mutate(formData);
    }
  };

  const handleEdit = (order: ServiceOrder) => {
    setEditingOrder(order);
    setFormData({
      osNumber: order.osNumber,
      clientId: order.clientId,
      vehicleId: order.vehicleId,
      mechanicId: order.mechanicId,
      services: order.services,
      totalValue: order.totalValue,
      status: order.status,
      unit: order.unit,
      observations: order.observations || "",
    });
    setOpen(true);
  };

  const getUnitColor = (unit: string) => {
    switch (unit) {
      case 'SP1': return '#2563eb';
      case 'SP2': return '#000000';
      case 'SOR': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'billed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'open': return 'Aberta';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluída';
      case 'billed': return 'Faturada';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
            <p className="text-muted-foreground">Gerencie as ordens de serviço</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌐 Todas as Unidades</SelectItem>
                <SelectItem value="SP1">🔵 São Paulo SP1</SelectItem>
                <SelectItem value="SP2">⚫ São Paulo SP2</SelectItem>
                <SelectItem value="SOR">🟢 Sorocaba SOR</SelectItem>
              </SelectContent>
            </Select>
            
            {canEditServiceOrder(currentUser) && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova OS
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingOrder ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientId">Cliente</Label>
                        <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client: Client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vehicleId">Veículo</Label>
                        <Select value={formData.vehicleId} onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o veículo" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle: Vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.plate} - {vehicle.model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mechanicId">Mecânico</Label>
                        <Select value={formData.mechanicId} onValueChange={(value) => setFormData({ ...formData, mechanicId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o mecânico" />
                          </SelectTrigger>
                          <SelectContent>
                            {mechanics.map((mechanic: UserType) => (
                              <SelectItem key={mechanic.id} value={mechanic.id}>
                                {mechanic.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unidade</Label>
                        <Select value={formData.unit} onValueChange={(value: any) => setFormData({ ...formData, unit: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SP1">São Paulo SP1</SelectItem>
                            <SelectItem value="SP2">São Paulo SP2</SelectItem>
                            <SelectItem value="SOR">Sorocaba SOR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="services">Serviços</Label>
                      <Textarea
                        id="services"
                        value={formData.services}
                        onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                        placeholder="Descreva os serviços a serem realizados..."
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="totalValue">Valor Total (R$)</Label>
                        <Input
                          id="totalValue"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.totalValue}
                          onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Aberta</SelectItem>
                            <SelectItem value="in_progress">Em Progresso</SelectItem>
                            <SelectItem value="completed">Concluída</SelectItem>
                            <SelectItem value="billed">Faturada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="observations">Observações</Label>
                      <Textarea
                        id="observations"
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        placeholder="Observações adicionais..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createOrderMutation.isPending || updateOrderMutation.isPending}>
                        {editingOrder ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Ordens de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : serviceOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma ordem de serviço encontrada
              </div>
            ) : (
              <div className="grid gap-4">
                {serviceOrders.map((order: ServiceOrder) => (
                  <Card key={order.id} className="border-l-4" style={{ borderLeftColor: getUnitColor(order.unit) }}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Wrench className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">
                              OS #{order.osNumber}
                            </h3>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusName(order.status)}
                            </Badge>
                            <Badge variant="outline" style={{ backgroundColor: getUnitColor(order.unit), color: 'white' }}>
                              {order.unit}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">Cliente:</span>
                              Carregando...
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              <span className="font-medium">Veículo:</span>
                              Carregando...
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Criada em:</span>
                              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          
                          <div className="bg-muted p-4 rounded-lg mb-4">
                            <h4 className="font-medium mb-2">Serviços:</h4>
                            <p className="text-sm">{order.services}</p>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-lg font-semibold text-foreground">
                              R$ {parseFloat(order.totalValue).toFixed(2)}
                            </div>
                            {order.observations && (
                              <div className="text-sm text-muted-foreground max-w-md">
                                <span className="font-medium">Obs:</span> {order.observations}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {canEditServiceOrder(currentUser) && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(order)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
