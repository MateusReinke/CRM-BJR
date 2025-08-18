import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Inventory() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
          <p className="text-muted-foreground">Controle de estoque e alertas</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Controle de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Funcionalidade em desenvolvimento...
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
