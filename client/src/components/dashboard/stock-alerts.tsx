import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useStore } from "@/contexts/store-context";
import type { Inventory } from "@shared/schema";

interface StockAlertsProps {
  selectedStoreId: string;
}

interface StockAlertsResponse {
  critical: Inventory[];
  low: Inventory[];
}

export default function StockAlerts({ selectedStoreId }: StockAlertsProps) {
  const { getStoreName } = useStore();
  const { data: alerts = { critical: [], low: [] }, isLoading } = useQuery<StockAlertsResponse>({
    queryKey: ["/api/inventory/alerts", { storeId: selectedStoreId }],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  const allAlerts = [
    ...alerts.critical.map((item) => ({ ...item, alertType: 'critical' as const })),
    ...alerts.low.map((item) => ({ ...item, alertType: 'low' as const })),
  ].slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas de Estoque</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allAlerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum alerta de estoque
          </div>
        ) : (
          allAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3">
              <div
                className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                  alert.alertType === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {alert.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span
                    className={`font-medium ${
                      alert.alertType === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`}
                  >
                    {alert.currentQuantity}
                  </span>{" "}
                  unidades restantes
                </p>
                <p className="text-xs text-muted-foreground">
                  {getStoreName(alert.storeId)}
                </p>
              </div>
            </div>
          ))
        )}

        <div className="mt-6">
          <Link
            href="/inventory"
            className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center"
          >
            Ver todos os alertas <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
