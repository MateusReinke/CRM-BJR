import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import KpiCard from "@/components/dashboard/kpi-card";
import RecentOrders from "@/components/dashboard/recent-orders";
import StockAlerts from "@/components/dashboard/stock-alerts";
import TopMechanics from "@/components/dashboard/top-mechanics";
import UnitPerformance from "@/components/dashboard/unit-performance";
import { Button } from "@/components/ui/button";
import { ClipboardList, AlertTriangle, DollarSign, Calendar, Plus, Download } from "lucide-react";
import { useUnit } from "@/contexts/unit-context";

interface DashboardKPIs {
  openOrders: number;
  inProgressOrders: number;
  monthlyRevenue: number;
  criticalStock: number;
  lowStock: number;
  todayAppointments: number;
}

export default function Dashboard() {
  const { selectedUnit } = useUnit();

  const { data: kpis, isLoading } = useQuery<DashboardKPIs>({
    queryKey: ["/api/dashboard/kpis", selectedUnit],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/kpis?unit=${selectedUnit}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      return res.json();
    }
  });

  const getUnitName = (unit: string) => {
    const unitNames = {
      'all': 'Todas as Unidades',
      'SP1': 'São Paulo SP1',
      'SP2': 'São Paulo SP2',
      'SOR': 'Sorocaba SOR'
    };
    return unitNames[unit as keyof typeof unitNames] || 'Todas as Unidades';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Carregando dashboard...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground" data-testid="text-dashboard-subtitle">
            Visão geral das operações - {" "}
            <span className="text-primary font-medium" data-testid="text-selected-unit">
              {getUnitName(selectedUnit)}
            </span>
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" data-testid="button-export-report">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
          <Button data-testid="button-new-os">
            <Plus className="mr-2 h-4 w-4" />
            Nova OS
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="container-kpi-cards">
        <div data-testid="card-open-orders">
          <KpiCard
            title="OS Abertas"
            value={kpis?.openOrders || 0}
            change="+8%"
            changeType="positive"
            icon={ClipboardList}
            iconColor="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            subtitle={`Em execução: ${kpis?.inProgressOrders || 0}`}
          />
        </div>
        
        <div data-testid="card-critical-stock">
          <KpiCard
            title="Estoque Crítico"
            value={kpis?.criticalStock || 0}
            change="+2"
            changeType="negative"
            icon={AlertTriangle}
            iconColor="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            subtitle={`Baixo estoque: ${kpis?.lowStock || 0}`}
          />
        </div>
        
        <div data-testid="card-monthly-revenue">
          <KpiCard
            title="Faturamento Mês"
            value={`R$ ${((kpis?.monthlyRevenue || 0) / 1000).toFixed(1)}K`}
            change="+12%"
            changeType="positive"
            icon={DollarSign}
            iconColor="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
            subtitle="Meta: R$ 50.0K"
          />
        </div>
        
        <div data-testid="card-today-appointments">
          <KpiCard
            title="Agendamentos Hoje"
            value={kpis?.todayAppointments || 0}
            change="-2"
            changeType="negative"
            icon={Calendar}
            iconColor="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
            subtitle="Próximos 7 dias: 24"
          />
        </div>
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentOrders selectedUnit={selectedUnit} />
        </div>
        <div>
          <StockAlerts selectedUnit={selectedUnit} />
        </div>
      </div>

      {/* Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMechanics selectedUnit={selectedUnit} />
        <UnitPerformance selectedUnit={selectedUnit} />
      </div>
    </Layout>
  );
}
