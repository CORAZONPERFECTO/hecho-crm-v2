import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2,
  Users,
  Truck,
  FileText,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import { useExpenses } from '@/hooks/useExpenses';
import ClientRevenueTable from './finances/ClientRevenueTable';

interface FinancesModuleProps {
  userRole?: string;
}

const FinancesModule: React.FC<FinancesModuleProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { tickets } = useTickets();
  const { fixedExpenses, ticketExpenses } = useExpenses();

  // Verificar acceso exclusivo para admin
  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground">
              Este módulo es exclusivo para el Administrador General
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cálculos financieros
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Ingresos (tickets facturados)
  const billedTickets = tickets.filter(ticket => 
    ticket.status === 'facturado-finalizado' &&
    new Date(ticket.created_at).getFullYear() === currentYear
  );
  const totalRevenue = billedTickets.length * 500; // Valor ejemplo

  // Gastos totales
  const totalFixedExpenses = fixedExpenses
    .filter(expense => expense.year === currentYear)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalVariableExpenses = ticketExpenses
    .filter(expense => new Date(expense.created_at).getFullYear() === currentYear)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  const netProfit = totalRevenue - totalExpenses;

  // Flotilla más rentable (ejemplo)
  const fleetPerformance = [
    { name: 'Flotilla Norte', profit: 245000, tickets: 89 },
    { name: 'Flotilla Sur', profit: 298000, tickets: 102 },
    { name: 'Flotilla Centro', profit: 187000, tickets: 67 }
  ];
  const topFleet = fleetPerformance.reduce((prev, current) => 
    (prev.profit > current.profit) ? prev : current
  );

  const summaryCards = [
    {
      title: 'Ingresos Totales',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <TrendingUp className="h-6 w-6" />,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-green-600'
    },
    {
      title: 'Gastos Totales',
      value: `$${totalExpenses.toLocaleString()}`,
      icon: <TrendingDown className="h-6 w-6" />,
      trend: '+3.2%',
      trendUp: false,
      color: 'text-red-600'
    },
    {
      title: 'Ganancia Neta',
      value: `$${netProfit.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      trend: '+18.7%',
      trendUp: netProfit > 0,
      color: netProfit > 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Flotilla Más Rentable',
      value: topFleet.name,
      icon: <Building2 className="h-6 w-6" />,
      trend: `$${topFleet.profit.toLocaleString()}`,
      trendUp: true,
      color: 'text-blue-600'
    }
  ];

  const tabItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'client-revenue', label: 'Ingresos por Cliente', icon: Users },
    { id: 'fleet-performance', label: 'Rendimiento de Flotillas', icon: Truck },
    { id: 'operational-expenses', label: 'Gastos Operativos', icon: TrendingDown },
    { id: 'project-costs', label: 'Costo por Proyecto', icon: Building2 },
    { id: 'consolidated-reports', label: 'Reportes Consolidados', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finanzas Generales</h1>
          <p className="text-muted-foreground">
            Panel de control financiero para administración general
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Año {currentYear}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          {tabItems.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {card.value}
                      </p>
                    </div>
                    <div className={`${card.color}`}>
                      {card.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className={`flex items-center ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trendUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      {card.trend}
                    </span>
                    <span className="text-muted-foreground ml-2">vs mes anterior</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ingresos</span>
                    <span className="text-green-600 font-semibold">
                      ${totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Gastos Fijos</span>
                    <span className="text-red-600 font-semibold">
                      ${totalFixedExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Gastos Variables</span>
                    <span className="text-red-600 font-semibold">
                      ${totalVariableExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">Ganancia Neta</span>
                      <span className={`font-bold ${netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${netProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Flotilla</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fleetPerformance.map((fleet, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">{fleet.name}</span>
                        <p className="text-xs text-muted-foreground">{fleet.tickets} tickets</p>
                      </div>
                      <span className="text-green-600 font-semibold">
                        ${fleet.profit.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="client-revenue">
          <ClientRevenueTable />
        </TabsContent>

        <TabsContent value="fleet-performance">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Flotillas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Módulo en desarrollo - Análisis de rendimiento por flotilla
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational-expenses">
          <Card>
            <CardHeader>
              <CardTitle>Gastos Operativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Módulo en desarrollo - Análisis detallado de gastos operativos
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project-costs">
          <Card>
            <CardHeader>
              <CardTitle>Costo por Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Módulo en desarrollo - Análisis de costos por proyecto
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consolidated-reports">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Consolidados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Módulo en desarrollo - Reportes financieros consolidados
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancesModule;