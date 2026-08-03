import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import KpiCard from "@/components/dashboard/kpi-card";
import RecentOrders from "@/components/dashboard/recent-orders";
import StockAlerts from "@/components/dashboard/stock-alerts";
import TopMechanics from "@/components/dashboard/top-mechanics";
import UnitPerformance from "@/components/dashboard/unit-performance";
import { ClipboardList, AlertTriangle, DollarSign, Calendar, Receipt } from "lucide-react";
import { useStore } from "@/contexts/store-context";

interface DashboardKPIs {
  openOrders: number;
  inProgressOrders: number;
  monthlyRevenue: number;
  criticalStock: number;
  lowStock: number;
  todayAppointments: number;
  monthlyExpenses: number;
  invoicesIssuedThisMonth: number;
}

export default function Dashboard() {
  const { selectedStoreId, getStoreName } = useStore();

  const { data: kpis, isLoading } = useQuery<DashboardKPIs>({
    queryKey: ["/api/dashboard/kpis", { storeId: selectedStoreId }],
  });

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

  const netResult = (kpis?.monthlyRevenue || 0) - (kpis?.monthlyExpenses || 0);

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground" data-testid="text-dashboard-subtitle">
            Visão geral das operações - {" "}
            <span className="text-primary font-medium" data-testid="text-selected-store">
              {getStoreName(selectedStoreId)}
            </span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="container-kpi-cards">
        <div data-testid="card-open-orders">
          <KpiCard
            title="OS Abertas"
            value={kpis?.openOrders || 0}
            icon={ClipboardList}
            iconColor="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            subtitle={`Em execução: ${kpis?.inProgressOrders || 0}`}
          />
        </div>

        <div data-testid="card-critical-stock">
          <KpiCard
            title="Estoque Crítico"
            value={kpis?.criticalStock || 0}
            icon={AlertTriangle}
            iconColor="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            subtitle={`Baixo estoque: ${kpis?.lowStock || 0}`}
          />
        </div>

        <div data-testid="card-monthly-revenue">
          <KpiCard
            title="Faturamento Mês"
            value={`R$ ${((kpis?.monthlyRevenue || 0) / 1000).toFixed(1)}K`}
            icon={DollarSign}
            iconColor="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
            subtitle={`Despesas: R$ ${((kpis?.monthlyExpenses || 0) / 1000).toFixed(1)}K · Líquido: R$ ${(netResult / 1000).toFixed(1)}K`}
          />
        </div>

        <div data-testid="card-today-appointments">
          <KpiCard
            title="Agendamentos Hoje"
            value={kpis?.todayAppointments || 0}
            icon={Calendar}
            iconColor="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
            subtitle="Próximos compromissos do dia"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div data-testid="card-invoices-issued">
          <KpiCard
            title="NFs Emitidas (Mês)"
            value={kpis?.invoicesIssuedThisMonth || 0}
            icon={Receipt}
            iconColor="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
            subtitle="NFS-e / NF-e / NFC-e"
          />
        </div>
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentOrders selectedStoreId={selectedStoreId} />
        </div>
        <div>
          <StockAlerts selectedStoreId={selectedStoreId} />
        </div>
      </div>

      {/* Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMechanics selectedUnit={selectedStoreId} />
        <UnitPerformance selectedUnit={selectedStoreId} />
      </div>
    </Layout>
  );
}
