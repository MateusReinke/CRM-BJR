import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UnitPerformanceProps {
  selectedUnit: string;
}

export default function UnitPerformance({ selectedUnit }: UnitPerformanceProps) {
  // Mock data for now - would come from API
  const units = [
    {
      name: "São Paulo SP1",
      revenue: 18500,
      orders: 24,
      color: "bg-unit-sp1",
      percentage: 75
    },
    {
      name: "Sorocaba SOR",
      revenue: 15200,
      orders: 19,
      color: "bg-unit-sor",
      percentage: 61
    },
    {
      name: "São Paulo SP2",
      revenue: 11500,
      orders: 16,
      color: "bg-unit-sp2",
      percentage: 46
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Unidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {units.map((unit) => (
          <div key={unit.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${unit.color}`} />
                <span className="text-sm font-medium text-foreground">
                  {unit.name}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                R$ {(unit.revenue / 1000).toFixed(1)}K
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${unit.color}`}
                style={{ width: `${unit.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {unit.orders} ordens de serviço
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
