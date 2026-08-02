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
import { useStore } from "@/contexts/store-context";
import type { Appointment, InsertAppointment, Client, Vehicle, User as UserType } from "@shared/schema";

type AppointmentFormData = Omit<InsertAppointment, 'scheduledDate'> & { scheduledDate: string };

export default function Appointments() {
  const { stores, selectedStoreId, setSelectedStoreId, getStoreName, getStoreColor } = useStore();
  const [open, setOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientId: "",
    vehicleId: "",
    mechanicId: "",
    scheduledDate: "",
    service: "",
    storeId: "",
    observations: "",
    isCompleted: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", { storeId: selectedStoreId }],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients", { storeId: selectedStoreId }],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles", { storeId: selectedStoreId }],
  });

  const { data: mechanics = [] } = useQuery<UserType[]>({
    queryKey: ["/api/employees", { storeId: selectedStoreId, role: "mechanic" }],
  });

  const clientsById = new Map(clients.map(c => [c.id, c]));
  const vehiclesById = new Map(vehicles.map(v => [v.id, v]));

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const res = await apiRequest("POST", "/api/appointments", { ...data, scheduledDate: new Date(data.scheduledDate) });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      setOpen(false);
      resetForm();
      toast({ title: "Agendamento criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar agendamento", description: error.message, variant: "destructive" });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AppointmentFormData> }) => {
      const payload = { ...data, ...(data.scheduledDate ? { scheduledDate: new Date(data.scheduledDate) } : {}) };
      const res = await apiRequest("PUT", `/api/appointments/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      setOpen(false);
      resetForm();
      toast({ title: "Agendamento atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar agendamento", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      vehicleId: "",
      mechanicId: "",
      scheduledDate: "",
      service: "",
      storeId: selectedStoreId !== 'all' ? selectedStoreId : (stores[0]?.id || ""),
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
      storeId: appointment.storeId,
      observations: appointment.observations || "",
      isCompleted: appointment.isCompleted,
    });
    setOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie os agendamentos da loja</p>
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
                          {clients.map((client) => (
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
                          {vehicles.map((vehicle) => (
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
                          {mechanics.map((mechanic) => (
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

                  <div className="space-y-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations || ""}
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
                {appointments.map((appointment) => {
                  const client = clientsById.get(appointment.clientId);
                  const vehicle = vehiclesById.get(appointment.vehicleId);
                  return (
                    <Card key={appointment.id} className="border-l-4" style={{ borderLeftColor: getStoreColor(appointment.storeId) }}>
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
                              <Badge variant="outline" style={{ backgroundColor: getStoreColor(appointment.storeId), color: 'white' }}>
                                {getStoreName(appointment.storeId)}
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
                                {client?.name || '-'}
                              </div>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                <span className="font-medium">Veículo:</span>
                                {vehicle ? `${vehicle.plate} - ${vehicle.model}` : '-'}
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
