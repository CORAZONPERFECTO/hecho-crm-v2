import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface HeaderActionsProps {
  onCreateStep: () => void;
  onCreateCategory: () => void;
  hasCategories: boolean;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  onCreateStep,
  onCreateCategory,
  hasCategories
}) => {
  return (
    <div className="flex gap-2">
      {hasCategories && (
        <Button variant="outline" onClick={onCreateStep}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Paso
        </Button>
      )}
      <Button onClick={onCreateCategory}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar Categoría
      </Button>
    </div>
  );
};

export default HeaderActions;