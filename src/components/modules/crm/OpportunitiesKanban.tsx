
import React from 'react';
import { Opportunity } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, User, Calendar, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';

interface OpportunitiesKanbanProps {
  opportunities: Opportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
}

const stages: Opportunity['stage'][] = ['Prospecto', 'En negociación', 'Cerrada ganada', 'Cerrada perdida'];

const stageConfig = {
    'Prospecto': { title: 'Prospectos', color: 'bg-blue-500' },
    'En negociación': { title: 'En Negociación', color: 'bg-yellow-500' },
    'Cerrada ganada': { title: 'Cerradas Ganadas', color: 'bg-green-500' },
    'Cerrada perdida': { title: 'Cerradas Perdidas', color: 'bg-red-500' },
};

const OpportunityCard: React.FC<{ opportunity: Opportunity, onStageChange: (id: string, stage: Opportunity['stage']) => void }> = ({ opportunity, onStageChange }) => {
  return (
    <Card className="mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-4 border-b">
        <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-semibold text-gray-800">{opportunity.name}</CardTitle>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-gray-800">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {stages.map(stage => (
                        <DropdownMenuItem key={stage} onSelect={() => onStageChange(opportunity.id, stage)}>
                            Mover a {stage}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <p className="text-xs text-muted-foreground">{opportunity.clientName}</p>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <DollarSign className="w-3 h-3 mr-2" />
          <span>Valor: ${opportunity.value.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <User className="w-3 h-3 mr-2" />
          <span>Responsable: {opportunity.owner}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 mr-2" />
          <span>Cierre: {opportunity.closeDate}</span>
        </div>
      </CardContent>
    </Card>
  )
};

const OpportunitiesKanban: React.FC<OpportunitiesKanbanProps> = ({ opportunities, setOpportunities }) => {
    
  const handleStageChange = (opportunityId: string, newStage: Opportunity['stage']) => {
    setOpportunities(prev => prev.map(opp => opp.id === opportunityId ? { ...opp, stage: newStage } : opp));
  };
    
  const opportunitiesByStage = stages.reduce((acc, stage) => {
    acc[stage] = opportunities.filter(opp => opp.stage === stage);
    return acc;
  }, {} as Record<Opportunity['stage'], Opportunity[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {stages.map(stage => (
        <div key={stage} className="bg-gray-100 rounded-lg">
          <div className="p-4 sticky top-0 bg-gray-100 z-10">
            <div className="flex items-center mb-4">
              <div className={`w-3 h-3 rounded-full mr-2 ${stageConfig[stage].color}`}></div>
              <h3 className="font-semibold text-gray-800">{stageConfig[stage].title}</h3>
              <span className="ml-2 text-sm text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
                  {opportunitiesByStage[stage].length}
              </span>
            </div>
          </div>
          <div className="p-4 pt-0 h-[calc(100vh-20rem)] overflow-y-auto">
            {opportunitiesByStage[stage].map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} onStageChange={handleStageChange} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OpportunitiesKanban;
