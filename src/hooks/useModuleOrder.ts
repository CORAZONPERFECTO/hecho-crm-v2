import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  stats?: string;
  allowedRoles: string[];
  isPinned?: boolean;
  isInProgress?: boolean;
}

export const useModuleOrder = (modules: Module[], userRole: string) => {
  const [moduleOrder, setModuleOrder] = useLocalStorage<string[]>(`moduleOrder_${userRole}`, []);
  const [pinnedModules, setPinnedModules] = useLocalStorage<string[]>(`pinnedModules_${userRole}`, []);
  const [inProgressModules, setInProgressModules] = useLocalStorage<string[]>(`inProgressModules_${userRole}`, []);

  // Inicializar el orden si está vacío
  useEffect(() => {
    if (moduleOrder.length === 0 && modules.length > 0) {
      const visibleModules = modules
        .filter(module => module.allowedRoles.includes(userRole))
        .map(module => module.id);
      setModuleOrder(visibleModules);
    }
  }, [modules, userRole, moduleOrder.length, setModuleOrder]);

  const getOrderedModules = (): Module[] => {
    const visibleModules = modules.filter(module => module.allowedRoles.includes(userRole));
    
    // Crear un mapa para acceso rápido
    const moduleMap = new Map(visibleModules.map(module => [module.id, module]));
    
    // Ordenar según el orden guardado
    const orderedIds = moduleOrder.filter(id => moduleMap.has(id));
    
    // Añadir módulos nuevos que no están en el orden guardado
    const newModules = visibleModules
      .filter(module => !moduleOrder.includes(module.id))
      .map(module => module.id);
    
    const allOrderedIds = [...orderedIds, ...newModules];
    
    return allOrderedIds.map(id => {
      const module = moduleMap.get(id)!;
      return {
        ...module,
        isPinned: pinnedModules.includes(id),
        isInProgress: inProgressModules.includes(id)
      };
    });
  };

  const moveModule = (fromIndex: number, toIndex: number) => {
    const orderedModules = getOrderedModules();
    const newOrder = [...orderedModules.map(m => m.id)];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setModuleOrder(newOrder);
  };

  const moveModuleUp = (moduleId: string) => {
    const orderedModules = getOrderedModules();
    const currentIndex = orderedModules.findIndex(m => m.id === moduleId);
    if (currentIndex > 0) {
      moveModule(currentIndex, currentIndex - 1);
    }
  };

  const moveModuleDown = (moduleId: string) => {
    const orderedModules = getOrderedModules();
    const currentIndex = orderedModules.findIndex(m => m.id === moduleId);
    if (currentIndex < orderedModules.length - 1) {
      moveModule(currentIndex, currentIndex + 1);
    }
  };

  const togglePin = (moduleId: string) => {
    const newPinned = pinnedModules.includes(moduleId)
      ? pinnedModules.filter(id => id !== moduleId)
      : [...pinnedModules, moduleId];
    setPinnedModules(newPinned);
  };

  const toggleInProgress = (moduleId: string) => {
    const newInProgress = inProgressModules.includes(moduleId)
      ? inProgressModules.filter(id => id !== moduleId)
      : [...inProgressModules, moduleId];
    setInProgressModules(newInProgress);
  };

  const reorderModules = (newOrder: string[]) => {
    setModuleOrder(newOrder);
  };

  return {
    orderedModules: getOrderedModules(),
    moveModuleUp,
    moveModuleDown,
    moveModule,
    togglePin,
    toggleInProgress,
    reorderModules
  };
};