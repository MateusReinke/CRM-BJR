import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative";
  icon: LucideIcon;
  iconColor: string;
  subtitle?: string;
}

export default function KpiCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconColor, 
  subtitle 
}: KpiCardProps) {
  return (
    <Card className="border border-border">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-foreground">
                  {value}
                </div>
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {changeType === 'positive' ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span className="sr-only">
                    {changeType === 'positive' ? 'Increased by' : 'Decreased by'}
                  </span>
                  {change}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      {subtitle && (
        <div className="bg-muted/50 px-5 py-3">
          <div className="text-sm text-muted-foreground">
            {subtitle}
          </div>
        </div>
      )}
    </Card>
  );
}
