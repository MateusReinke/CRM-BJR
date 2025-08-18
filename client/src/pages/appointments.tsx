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
import { Plus, Edit, Calendar, Clock, User, Car } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Appointment, InsertAppointment, Client, Vehicle, User as UserType } from "@shared/schema";

export default function Appointments() {
  const [open, setOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [formData, setFormData] = useState<InsertAppointment>({
    clientId: "",
    vehicleId: "",
    mechanicId: "",
    scheduledDate: "",
    service: "",
    unit: "SP1",
    observations: "",
    isCompleted: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/appointments/all"],
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

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setOpen(false);
      resetForm();
      toast({ title: "Agendamento criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar agendamento", variant: "destructive" });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAppointment> }) => {
      const res = await apiRequest("PUT", `/api/appointments/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setOpen(false);
      resetForm();
      toast({ title: "Agendamento atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar agendamento", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      vehicleId: "",
      mechanicId: "",
      scheduledDate: "",
      service: "",
      unit: "SP1",
      observations: "",
      isCompleted: false,
    });
    setEditingAppointment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAppointment) {
      updateAppointmentMutation.mutate({ id: editingAppointment.id, data: formData });
    } else {
      createAppointmentMutation.mutate(formData);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const scheduledDate = new Date(appointment.scheduledDate);
    setFormData({
      clientId: appointment.clientId,
      vehicleId: appointment.vehicleId,
      mechanicId: appointment.mechanicId,
      scheduledDate: scheduledDate.toISOString().slice(0, 16),
      service: appointment.service,
      unit: appointment.unit,
      observations: appointment.observations || "",
      isCompleted: appointment.isCompleted,
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie os agendamentos da unidade</p>
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
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
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
                      <Label htmlFor="scheduledDate">Data e Hora</Label>
                      <Input
                        id="scheduledDate"
                        type="datetime-local"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service">Serviço</Label>
                      <Input
                        id="service"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        placeholder="Ex: Revisão, Troca de óleo..."
                        required
                      />
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
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      placeholder="Observações sobre o agendamento..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}>
                      {editingAppointment ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum agendamento encontrado
              </div>
            ) : (
              <div className="grid gap-4">
                {appointments.map((appointment: Appointment) => (
                  <Card key={appointment.id} className="border-l-4" style={{ borderLeftColor: getUnitColor(appointment.unit) }}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">
                              {appointment.service}
                            </h3>
                            {appointment.isCompleted && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Concluído
                              </Badge>
                            )}
                            <Badge variant="outline" style={{ backgroundColor: getUnitColor(appointment.unit), color: 'white' }}>
                              {appointment.unit}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Data:</span>
                              {new Date(appointment.scheduledDate).toLocaleString('pt-BR')}
                            </div>
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
                          </div>
                          
                          {appointment.observations && (
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm">{appointment.observations}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(appointment)}>
                            <Edit className="h-4 w-4" />
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
