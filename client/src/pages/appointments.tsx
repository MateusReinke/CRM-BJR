import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Appointments() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos da unidade</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Agendamentos</CardTitle>
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
