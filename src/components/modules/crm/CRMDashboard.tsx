
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Target, Clock } from 'lucide-react';
import { Opportunity } from './types';

interface CRMDashboardProps {
  opportunities: Opportunity[];
}

const CRMDashboard: React.FC<CRMDashboardProps> = ({ opportunities }) => {
  const activeOpportunities = opportunities.filter(o => o.stage === 'En negociación' || o.stage === 'Prospecto');
  const closedWonThisMonth = opportunities.filter(o => {
    if (o.stage !== 'Cerrada ganada') return false;
    const closeDate = new Date(o.closeDate);
    const today = new Date();
    // Ensure date is valid before comparing
    if (isNaN(closeDate.getTime())) return false;
    return closeDate.getMonth() === today.getMonth() && closeDate.getFullYear() === today.getFullYear();
  });
  const totalValue = activeOpportunities.reduce((sum, o) => sum + o.value, 0);

  // Placeholder data for other cards
  const activeClients = 12; // Placeholder
  const upcomingFollowUps = 5; // Placeholder

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeClients}</div>
          <p className="text-xs text-muted-foreground">+2% desde el mes pasado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Oportunidades Abiertas</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeOpportunities.length}</div>
          <p className="text-xs text-muted-foreground">Valor estimado: ${totalValue.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{closedWonThisMonth.length}</div>
          <p className="text-xs text-muted-foreground">Total: ${closedWonThisMonth.reduce((s, o) => s + o.value, 0).toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Seguimientos (Semana)</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingFollowUps}</div>
          <p className="text-xs text-muted-foreground">3 para hoy</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMDashboard;
