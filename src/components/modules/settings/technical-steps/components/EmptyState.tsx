import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateCategory: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateCategory }) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-muted rounded-full">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No hay categorías configuradas</h3>
            <p className="text-muted-foreground max-w-md">
              Comienza agregando una categoría para organizar los pasos técnicos. 
              Esto te permitirá crear flujos de trabajo estructurados para tus tickets.
            </p>
          </div>
          <Button onClick={onCreateCategory} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Primera Categoría
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;