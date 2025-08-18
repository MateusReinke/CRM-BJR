import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Calendar, FileText } from "lucide-react";
import type { FinancialTransaction } from "@shared/schema";

export default function Financial() {
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/financial/all"],
  });

  const getUnitColor = (unit: string) => {
    switch (unit) {
      case 'SP1': return '#2563eb';
      case 'SP2': return '#000000';
      case 'SOR': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'expense': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'income': return 'Receita';
      case 'expense': return 'Despesa';
      default: return type;
    }
  };

  // Cálculos de resumo
  const totalIncome = transactions
    .filter((t: FinancialTransaction) => t.type === 'income')
    .reduce((sum: number, t: FinancialTransaction) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter((t: FinancialTransaction) => t.type === 'expense')
    .reduce((sum: number, t: FinancialTransaction) => sum + parseFloat(t.amount), 0);

  const netProfit = totalIncome - totalExpenses;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
            <p className="text-muted-foreground">Controle de receitas e despesas</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-01">Janeiro 2025</SelectItem>
                <SelectItem value="2024-12">Dezembro 2024</SelectItem>
                <SelectItem value="2024-11">Novembro 2024</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌐 Todas as Unidades</SelectItem>
                <SelectItem value="SP1">🔵 São Paulo SP1</SelectItem>
                <SelectItem value="SP2">⚫ São Paulo SP2</SelectItem>
                <SelectItem value="SOR">🟢 Sorocaba SOR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Receitas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12.5% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Despesas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                -3.2% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lucro Líquido
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {netProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {netProfit >= 0 ? 'Lucro' : 'Prejuízo'} do período
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Lista de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentação Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma movimentação financeira encontrada
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction: FinancialTransaction) => (
                  <Card key={transaction.id} className="border-l-4" style={{ borderLeftColor: getUnitColor(transaction.unit) }}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">
                              {transaction.description}
                            </h3>
                            <Badge className={getTypeColor(transaction.type)}>
                              {getTypeName(transaction.type)}
                            </Badge>
                            <Badge variant="outline" style={{ backgroundColor: getUnitColor(transaction.unit), color: 'white' }}>
                              {transaction.unit}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Data:</span>
                              {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Categoria:</span>
                              {transaction.category}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className={`text-xl font-bold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'expense' ? '-' : '+'}R$ {parseFloat(transaction.amount).toFixed(2)}
                            </div>
                            {transaction.serviceOrderId && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">OS:</span> #{transaction.serviceOrderId}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
