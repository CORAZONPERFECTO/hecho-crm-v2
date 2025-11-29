import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Edit, Trash2, Info } from 'lucide-react';
import { TicketCategory, TechnicalStep } from '@/hooks/useTicketCategories';
import { MESSAGES } from './constants';
import DraggableStepsList from './DraggableStepsList';

interface CategoryCardProps {
  category: TicketCategory;
  categorySteps: TechnicalStep[];
  isExpanded: boolean;
  editingStepId: string | null;
  editValue: string;
  onToggleExpanded: (categoryId: string) => void;
  onEditCategory: (category: TicketCategory) => void;
  onDeleteCategory: (id: string, name: string) => void;
  onReorderSteps: (steps: TechnicalStep[]) => void;
  onStartEdit: (step: TechnicalStep) => void;
  onSaveEdit: (stepId: string) => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  onDeleteStep: (stepId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  categorySteps,
  isExpanded,
  editingStepId,
  editValue,
  onToggleExpanded,
  onEditCategory,
  onDeleteCategory,
  onReorderSteps,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  onDeleteStep
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpanded(category.id)}
              className="p-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {categorySteps.length} pasos
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditCategory(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeleteCategory(category.id, category.name)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <strong>Orden de Prioridad:</strong> {MESSAGES.PRIORITY_INFO}
            </p>
          </div>
          <DraggableStepsList
            steps={categorySteps}
            onReorder={onReorderSteps}
            editingStepId={editingStepId}
            editValue={editValue}
            onStartEdit={onStartEdit}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onEditValueChange={onEditValueChange}
            onDeleteStep={onDeleteStep}
          />
        </CardContent>
      )}
    </Card>
  );
};

export default CategoryCard;