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
import { Plus, Edit, Trash2, User, Mail, Shield, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { canManageEmployees, getRoleName } from "@/lib/permissions";
import { useStore } from "@/contexts/store-context";
import type { User as UserType, InsertUser } from "@shared/schema";

export default function Employees() {
  const { stores, selectedStoreId, setSelectedStoreId, getStoreName, getStoreColor } = useStore();
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserType | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [formData, setFormData] = useState<InsertUser>({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "mechanic",
    storeId: "",
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Check permissions
  if (!canManageEmployees(currentUser)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para gerenciar funcionários.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  const { data: employees = [], isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/employees", { storeId: selectedStoreId, role: selectedRole }],
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await apiRequest("POST", "/api/employees", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setOpen(false);
      resetForm();
      toast({ title: "Funcionário criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar funcionário", description: error.message, variant: "destructive" });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertUser> }) => {
      const res = await apiRequest("PUT", `/api/employees/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setOpen(false);
      resetForm();
      toast({ title: "Funcionário atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar funcionário", description: error.message, variant: "destructive" });
    },
  });

  const toggleEmployeeStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/employees/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Status do funcionário atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      name: "",
      email: "",
      role: "mechanic",
      storeId: selectedStoreId !== 'all' ? selectedStoreId : (stores[0]?.id || ""),
      isActive: true,
    });
    setEditingEmployee(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      // Don't send password if not changed
      const updateData: Partial<InsertUser> = { ...formData };
      if (!updateData.password || updateData.password === "") {
        delete updateData.password;
      }
      updateEmployeeMutation.mutate({ id: editingEmployee.id, data: updateData });
    } else {
      createEmployeeMutation.mutate(formData);
    }
  };

  const handleEdit = (employee: UserType) => {
    setEditingEmployee(employee);
    setFormData({
      username: employee.username,
      password: "", // Don't pre-fill password
      name: employee.name,
      email: employee.email,
      role: employee.role,
      storeId: employee.storeId,
      isActive: employee.isActive,
    });
    setOpen(true);
  };

  const handleToggleStatus = (employee: UserType) => {
    const action = employee.isActive ? "desativar" : "ativar";
    if (confirm(`Tem certeza que deseja ${action} este funcionário?`)) {
      toggleEmployeeStatusMutation.mutate({ id: employee.id, isActive: !employee.isActive });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'manager': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'hr': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'seller': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'mechanic': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Funcionários</h1>
            <p className="text-muted-foreground">Gerencie os funcionários da empresa</p>
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

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">👥 Todos os Cargos</SelectItem>
                <SelectItem value="admin">🔴 Administrador</SelectItem>
                <SelectItem value="manager">🟣 Gerente</SelectItem>
                <SelectItem value="hr">🟠 RH</SelectItem>
                <SelectItem value="seller">🔵 Vendedor</SelectItem>
                <SelectItem value="mechanic">🟢 Mecânico</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Funcionário
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="João da Silva"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="joao@bjrautomotivo.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nome de Usuário</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="joao.silva"
                        required
                        disabled={!!editingEmployee}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">
                        {editingEmployee ? "Nova Senha (deixe vazio para manter)" : "Senha"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        required={!editingEmployee}
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Cargo</Label>
                      <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="hr">Recursos Humanos</SelectItem>
                          <SelectItem value="seller">Vendedor</SelectItem>
                          <SelectItem value="mechanic">Mecânico</SelectItem>
                        </SelectContent>
                      </Select>
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

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}>
                      {editingEmployee ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum funcionário encontrado
              </div>
            ) : (
              <div className="grid gap-4">
                {employees.map((employee) => (
                  <Card key={employee.id} className="relative overflow-hidden border-l-4" style={{ borderLeftColor: getStoreColor(employee.storeId) }}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">
                              {employee.name}
                            </h3>
                            <Badge variant="outline" style={{ backgroundColor: getStoreColor(employee.storeId), color: 'white' }}>
                              {getStoreName(employee.storeId)}
                            </Badge>
                            <Badge className={getRoleColor(employee.role)}>
                              {getRoleName(employee.role)}
                            </Badge>
                            {!employee.isActive && (
                              <Badge variant="destructive">
                                Inativo
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">Usuário:</span>
                              {employee.username}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="font-medium">E-mail:</span>
                              {employee.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span className="font-medium">Ativo desde:</span>
                              {new Date(employee.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(employee)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(employee)}
                            className={employee.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                          >
                            {employee.isActive ? <Trash2 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
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
