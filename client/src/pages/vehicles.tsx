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
import { Plus, Edit, Trash2, Car, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Vehicle, InsertVehicle, Client } from "@shared/schema";

export default function Vehicles() {
  const [open, setOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [formData, setFormData] = useState<InsertVehicle>({
    plate: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    chassis: "",
    mileage: 0,
    clientId: "",
    unit: "SP1",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["/api/vehicles", selectedUnit],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      const res = await apiRequest("POST", "/api/vehicles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setOpen(false);
      resetForm();
      toast({ title: "Veículo criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar veículo", variant: "destructive" });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertVehicle> }) => {
      const res = await apiRequest("PUT", `/api/vehicles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setOpen(false);
      resetForm();
      toast({ title: "Veículo atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar veículo", variant: "destructive" });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Veículo excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir veículo", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      plate: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      chassis: "",
      mileage: 0,
      clientId: "",
      unit: "SP1",
    });
    setEditingVehicle(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicleMutation.mutate({ id: editingVehicle.id, data: formData });
    } else {
      createVehicleMutation.mutate(formData);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      chassis: vehicle.chassis || "",
      mileage: vehicle.mileage || 0,
      clientId: vehicle.clientId,
      unit: vehicle.unit,
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este veículo?")) {
      deleteVehicleMutation.mutate(id);
    }
  };

  const getUnitColor = (unit: string) => {
    switch (unit) {
      case 'SP1': return '#2563eb';
      case 'SP2': return '#000000';
      case 'SOR': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getUnitName = (unit: string) => {
    switch (unit) {
      case 'SP1': return 'São Paulo SP1';
      case 'SP2': return 'São Paulo SP2';
      case 'SOR': return 'Sorocaba SOR';
      default: return unit;
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client?.name || "Cliente não encontrado";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Veículos</h1>
            <p className="text-muted-foreground">Gerencie os veículos dos clientes</p>
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
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Veículo
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingVehicle ? "Editar Veículo" : "Novo Veículo"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plate">Placa</Label>
                      <Input
                        id="plate"
                        value={formData.plate}
                        onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                        placeholder="ABC-1234"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="Honda Civic"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Ano</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        min="1990"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="color">Cor</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Quilometragem</Label>
                      <Input
                        id="mileage"
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Cliente</Label>
                      <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client: Client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} ({client.unit})
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
                    <Label htmlFor="chassis">Chassi (Opcional)</Label>
                    <Input
                      id="chassis"
                      value={formData.chassis}
                      onChange={(e) => setFormData({ ...formData, chassis: e.target.value })}
                      placeholder="9BG123456789"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}>
                      {editingVehicle ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum veículo encontrado
              </div>
            ) : (
              <div className="grid gap-4">
                {vehicles.map((vehicle: Vehicle & { client: Client }) => (
                  <Card key={vehicle.id} className="relative overflow-hidden border-l-4" style={{ borderLeftColor: getUnitColor(vehicle.unit) }}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Car className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">
                              {vehicle.model} - {vehicle.plate}
                            </h3>
                            <Badge variant="outline" style={{ backgroundColor: getUnitColor(vehicle.unit), color: 'white' }}>
                              {getUnitName(vehicle.unit)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Cliente:</span>
                              {getClientName(vehicle.clientId)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Ano:</span>
                              {vehicle.year}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Cor:</span>
                              {vehicle.color}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">KM:</span>
                              {vehicle.mileage?.toLocaleString() || "N/A"}
                            </div>
                          </div>
                          
                          {vehicle.chassis && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium">Chassi:</span> {vehicle.chassis}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(vehicle)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(vehicle.id)}>
                            <Trash2 className="h-4 w-4" />
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
