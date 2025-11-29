import { Button } from '@/components/ui/button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useModuleOrder, Module } from '@/hooks/useModuleOrder';
import { ALL_MODULES } from '@/constants/modules';

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  stats?: string;
  onClick: () => void;
  userRole?: 'admin' | 'technician' | 'manager';
  allowedRoles: string[];
  isPinned?: boolean;
  isInProgress?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePin: () => void;
  onToggleInProgress: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isReorderMode: boolean;
}

interface SortableModuleCardProps extends ModuleCardProps { }

const SortableModuleCard: React.FC<SortableModuleCardProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ModuleCard {...props} dragListeners={listeners} />
    </div>
  );
};

const ModuleCard: React.FC<ModuleCardProps & { dragListeners?: any }> = ({
  id,
  title,
  description,
  icon,
  gradient,
  stats,
  onClick,
  userRole = 'admin',
  allowedRoles,
  isPinned,
  isInProgress,
  onMoveUp,
  onMoveDown,
  onTogglePin,
  onToggleInProgress,
  canMoveUp,
  canMoveDown,
  isReorderMode,
  dragListeners
}) => {
  if (!allowedRoles.includes(userRole)) return null;

  const handleCardClick = (e: React.MouseEvent) => {
    if (isReorderMode) {
      e.preventDefault();
      return;
    }
    onClick();
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-2xl transition-all duration-300 group border-0 shadow-lg relative ${!isReorderMode ? 'hover-lift hover-scale' : ''
        } ${isPinned ? 'ring-2 ring-primary' : ''} ${isInProgress ? 'ring-2 ring-amber-500' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Botones de control en modo reordenamiento */}
        {isReorderMode && (
          <div className="absolute top-2 right-2 flex flex-col gap-1 bg-white/90 p-1 rounded-lg shadow-md">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => handleButtonClick(e, onTogglePin)}
                title={isPinned ? "Desfijar" : "Fijar"}
              >
                {isPinned ? <PinOff size={12} /> : <Pin size={12} />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => handleButtonClick(e, onToggleInProgress)}
                title={isInProgress ? "Quitar de en progreso" : "Marcar en progreso"}
              >
                {isInProgress ? <Pause size={12} /> : <Play size={12} />}
              </Button>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => handleButtonClick(e, onMoveUp)}
                disabled={!canMoveUp}
                title="Mover arriba"
              >
                <ChevronUp size={12} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => handleButtonClick(e, onMoveDown)}
                disabled={!canMoveDown}
                title="Mover abajo"
              >
                <ChevronDown size={12} />
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
              {...dragListeners}
              title="Arrastrar"
            >
              <GripVertical size={12} />
            </Button>
          </div>
        )}

        {/* Indicadores de estado */}
        <div className="absolute top-2 left-2 flex gap-1">
          {isPinned && <Pin className="text-blue-500" size={16} />}
          {isInProgress && <Play className="text-amber-500" size={16} />}
        </div>

        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 ${gradient} rounded-2xl flex items-center justify-center ${!isReorderMode ? 'group-hover:scale-110' : ''
            } transition-transform duration-300 shadow-lg`}>
            {icon}
          </div>
          {stats && (
            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
              {stats}
            </span>
          )}
        </div>
        <h3 className={`font-bold text-foreground text-fluid-lg mb-2 ${!isReorderMode ? 'group-hover:text-primary' : ''
          } transition-colors`}>
          {title}
        </h3>
        <p className="text-fluid-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

interface DashboardGridProps {
  onModuleSelect: (module: string) => void;
  userRole?: 'admin' | 'technician' | 'manager';
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ onModuleSelect, userRole = 'admin' }) => {
  const [isReorderMode, setIsReorderMode] = useState(false);

  const modules = ALL_MODULES;

  const {
    orderedModules,
    moveModuleUp,
    moveModuleDown,
    togglePin,
    toggleInProgress,
    reorderModules
  } = useModuleOrder(modules, userRole);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = orderedModules.findIndex((module) => module.id === active.id);
      const newIndex = orderedModules.findIndex((module) => module.id === over?.id);

      const newOrder = arrayMove(orderedModules.map(m => m.id), oldIndex, newIndex);
      reorderModules(newOrder);
    }
  };

  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'technician':
        return 'Panel de Técnico';
      case 'manager':
        return 'Panel de Gestión';
      default:
        return 'Panel de Administración';
    }
  };

  return (
    <div className="padding-responsive bg-gradient-to-br from-background to-muted/20 min-h-screen">
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-in">
                <Target className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-fluid-2xl font-bold text-foreground mb-1">{getWelcomeMessage()}</h1>
                <p className="text-fluid-sm text-muted-foreground">Gestiona tu negocio de forma integral</p>
              </div>
            </div>
            <Button
              onClick={() => setIsReorderMode(!isReorderMode)}
              variant={isReorderMode ? "default" : "outline"}
              className="flex items-center gap-2 hover-scale self-start sm:self-center"
            >
              <GripVertical size={16} />
              <span className="hidden sm:inline">{isReorderMode ? 'Finalizar' : 'Reordenar'}</span>
              <span className="sm:hidden">{isReorderMode ? 'OK' : 'Edit'}</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="responsive-grid mb-6 sm:mb-8">
          <div className="bg-card p-4 rounded-2xl shadow-lg border border-border hover-lift animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center space-x-3">
              <TrendingUp className="text-green-500" size={20} />
              <div>
                <p className="text-fluid-xs text-muted-foreground">Ventas Hoy</p>
                <p className="font-bold text-fluid-lg text-foreground">₡125,000</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-2xl shadow-lg border border-border hover-lift animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center space-x-3">
              <Users className="text-blue-500" size={20} />
              <div>
                <p className="text-fluid-xs text-muted-foreground">Clientes</p>
                <p className="font-bold text-fluid-lg text-foreground">1,234</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-2xl shadow-lg border border-border hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center space-x-3">
              <Ticket className="text-purple-500" size={20} />
              <div>
                <p className="text-fluid-xs text-muted-foreground">Tickets</p>
                <p className="font-bold text-fluid-lg text-foreground">47</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-2xl shadow-lg border border-border hover-lift animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center space-x-3">
              <Zap className="text-yellow-500" size={20} />
              <div>
                <p className="text-fluid-xs text-muted-foreground">Eficiencia</p>
                <p className="font-bold text-fluid-lg text-foreground">94%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedModules.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="fluid-grid">
              {orderedModules.map((module, index) => {
                if (isReorderMode) {
                  return (
                    <div
                      key={module.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <SortableModuleCard
                        id={module.id}
                        title={module.title}
                        description={module.description}
                        icon={module.icon}
                        gradient={module.gradient}
                        stats={module.stats}
                        onClick={() => onModuleSelect(module.id)}
                        userRole={userRole}
                        allowedRoles={module.allowedRoles}
                        isPinned={module.isPinned}
                        isInProgress={module.isInProgress}
                        onMoveUp={() => moveModuleUp(module.id)}
                        onMoveDown={() => moveModuleDown(module.id)}
                        onTogglePin={() => togglePin(module.id)}
                        onToggleInProgress={() => toggleInProgress(module.id)}
                        canMoveUp={index > 0}
                        canMoveDown={index < orderedModules.length - 1}
                        isReorderMode={isReorderMode}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={module.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ModuleCard
                        id={module.id}
                        title={module.title}
                        description={module.description}
                        icon={module.icon}
                        gradient={module.gradient}
                        stats={module.stats}
                        onClick={() => onModuleSelect(module.id)}
                        userRole={userRole}
                        allowedRoles={module.allowedRoles}
                        isPinned={module.isPinned}
                        isInProgress={module.isInProgress}
                        onMoveUp={() => moveModuleUp(module.id)}
                        onMoveDown={() => moveModuleDown(module.id)}
                        onTogglePin={() => togglePin(module.id)}
                        onToggleInProgress={() => toggleInProgress(module.id)}
                        canMoveUp={index > 0}
                        canMoveDown={index < orderedModules.length - 1}
                        isReorderMode={isReorderMode}
                      />
                    </div>
                  );
                }
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default DashboardGrid;
