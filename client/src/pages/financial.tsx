import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Financial() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Controle de receitas e despesas</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Movimentação Financeira</CardTitle>
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
