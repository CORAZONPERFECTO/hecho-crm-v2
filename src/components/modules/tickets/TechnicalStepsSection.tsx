
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, CheckCircle, Wrench, ClipboardList, Package } from 'lucide-react';
import { useDynamicTechnicalSteps, DynamicTechnicalStep } from '@/hooks/useDynamicTechnicalSteps';

interface TechnicalStepsSectionProps {
  ticketId: string;
  serviceType: string;
  onStepsUpdate?: (steps: DynamicTechnicalStep[]) => void;
}

const TechnicalStepsSection: React.FC<TechnicalStepsSectionProps> = ({
  ticketId,
  serviceType,
  onStepsUpdate
}) => {
  const { serviceData, loading } = useDynamicTechnicalSteps(serviceType);
  const [steps, setSteps] = useState<DynamicTechnicalStep[]>([]);
  const [isStepsOpen, setIsStepsOpen] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  // Inicializar pasos desde localStorage o datos por defecto
  useEffect(() => {
    if (serviceData) {
      const savedSteps = localStorage.getItem(`technical-steps-${ticketId}`);
      if (savedSteps) {
        try {
          const parsedSteps = JSON.parse(savedSteps);
          // Combinar con los datos actuales de la base de datos
          const updatedSteps = serviceData.steps.map(step => {
            const savedStep = parsedSteps.find((s: any) => s.id === step.id);
            return savedStep ? { ...step, completed: savedStep.completed, observation: savedStep.observation } : step;
          });
          setSteps(updatedSteps);
        } catch (error) {
          console.error('Error parsing saved steps:', error);
          setSteps(serviceData.steps);
        }
      } else {
        setSteps(serviceData.steps);
      }
    }
  }, [ticketId, serviceData]);

  // Guardar pasos en localStorage cuando cambien
  useEffect(() => {
    if (steps.length > 0) {
      localStorage.setItem(`technical-steps-${ticketId}`, JSON.stringify(steps));
      onStepsUpdate?.(steps);
    }
  }, [steps, ticketId, onStepsUpdate]);

  const handleStepToggle = (stepId: string, completed: boolean) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, completed } : step
      )
    );
  };

  const handleObservationChange = (stepId: string, observation: string) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, observation } : step
      )
    );
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serviceData) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center text-gray-500">
          <ClipboardList size={48} className="mx-auto mb-4 text-gray-400" />
          <p>No se encontraron pasos técnicos para este tipo de servicio.</p>
          <p className="text-sm mt-2">Configure los pasos en el módulo de Configuración &gt; Listas.</p>
        </CardContent>
      </Card>
    );
  }

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList size={20} />
            Pasos Técnicos - {serviceType}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={completedSteps === totalSteps ? "default" : "secondary"}>
              {completedSteps}/{totalSteps} completados
            </Badge>
            {completedSteps === totalSteps && (
              <CheckCircle size={20} className="text-green-600" />
            )}
          </div>
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de Pasos */}
        <Collapsible open={isStepsOpen} onOpenChange={setIsStepsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-gray-50 p-2 rounded">
            {isStepsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="font-medium">Pasos a seguir ({steps.length})</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {steps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={step.completed}
                    onCheckedChange={(checked) => handleStepToggle(step.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={step.step_order === 1 ? "default" : "secondary"} 
                        className={`text-xs px-2 py-1 ${
                          step.step_order === 1 
                            ? 'bg-blue-100 text-blue-800 border-blue-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Paso {step.step_order}
                        {step.step_order === 1 && " (Prioridad)"}
                      </Badge>
                      {step.completed && (
                        <CheckCircle size={16} className="text-green-600" />
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${step.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Observaciones (opcional)
                  </label>
                  <Textarea
                    value={step.observation || ''}
                    onChange={(e) => handleObservationChange(step.id, e.target.value)}
                    placeholder="Agregar observaciones sobre este paso..."
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Herramientas y Materiales Sugeridos */}
        <Collapsible open={isToolsOpen} onOpenChange={setIsToolsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-gray-50 p-2 rounded">
            {isToolsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Wrench size={16} />
            <span className="font-medium">Herramientas y materiales sugeridos ({serviceData.tools.length})</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Wrench size={16} />
                  Herramientas
                </h4>
                <div className="space-y-2">
                  {serviceData.tools
                    .filter(tool => tool.tool_type === 'herramienta')
                    .map((tool, index) => (
                    <div key={tool.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Wrench size={14} className="text-gray-500" />
                      <span className="text-sm">{tool.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Package size={16} />
                  Materiales
                </h4>
                <div className="space-y-2">
                  {serviceData.tools
                    .filter(tool => tool.tool_type === 'material')
                    .map((tool, index) => (
                    <div key={tool.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Package size={14} className="text-gray-500" />
                      <span className="text-sm">{tool.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default TechnicalStepsSection;
