import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Vehicles() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground">Gerencie os veículos cadastrados</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Veículos</CardTitle>
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
