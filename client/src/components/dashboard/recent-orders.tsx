import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";

interface RecentOrdersProps {
  selectedUnit: string;
}

export default function RecentOrders({ selectedUnit }: RecentOrdersProps) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/service-orders", selectedUnit],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'billed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'in_progress':
        return 'Em Execução';
      case 'completed':
        return 'Concluído';
      case 'billed':
        return 'Faturado';
      default:
        return status;
    }
  };

  const getUnitColor = (unit: string) => {
    switch (unit) {
      case 'SP1':
        return 'bg-unit-sp1';
      case 'SP2':
        return 'bg-unit-sp2';
      case 'SOR':
        return 'bg-unit-sor';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ordens de Serviço Recentes</CardTitle>
        <Link href="/service-orders" className="text-primary hover:text-primary/80 text-sm font-medium">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3">OS</TableHead>
              <TableHead className="px-6 py-3">Cliente</TableHead>
              <TableHead className="px-6 py-3">Veículo</TableHead>
              <TableHead className="px-6 py-3">Status</TableHead>
              <TableHead className="px-6 py-3">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.slice(0, 5).map((order: any) => (
              <TableRow key={order.id} className="hover:bg-muted/50">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${getUnitColor(order.unit)}`} />
                    <span className="text-sm font-medium text-foreground">
                      {order.osNumber}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">
                  Cliente
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  Veículo
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-medium text-foreground">
                  R$ {Number(order.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
