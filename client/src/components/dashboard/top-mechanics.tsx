import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopMechanicsProps {
  selectedUnit: string;
}

export default function TopMechanics({ selectedUnit }: TopMechanicsProps) {
  // Mock data for now - would come from API
  const mechanics = [
    { 
      name: "José Silva", 
      unit: "São Paulo SP1", 
      commission: 1250, 
      orders: 15,
      initials: "JS"
    },
    { 
      name: "Marcos Alves", 
      unit: "Sorocaba SOR", 
      commission: 980, 
      orders: 12,
      initials: "MA"
    },
    { 
      name: "Paulo Costa", 
      unit: "São Paulo SP2", 
      commission: 875, 
      orders: 11,
      initials: "PC"
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Mecânicos (Mês)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mechanics.map((mechanic) => (
          <div key={mechanic.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-foreground">
                  {mechanic.initials}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {mechanic.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mechanic.unit}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                R$ {mechanic.commission.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-muted-foreground">
                {mechanic.orders} OS
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
