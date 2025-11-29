import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';

interface TasksHeaderProps {
  canCreate: boolean;
  onCreateTask: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  canCreate,
  onCreateTask,
  showFilters,
  onToggleFilters
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-800">Lista de Tareas</h1>
      <div className="flex space-x-3">
        <Button 
          variant="outline"
          onClick={onToggleFilters}
          className={showFilters ? "bg-blue-50 border-blue-300" : ""}
        >
          <Filter size={16} className="mr-2" />
          Filtros
        </Button>
        {canCreate && (
          <Button 
            onClick={onCreateTask}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Nueva Tarea
          </Button>
        )}
      </div>
    </div>
  );
};

export default TasksHeader;