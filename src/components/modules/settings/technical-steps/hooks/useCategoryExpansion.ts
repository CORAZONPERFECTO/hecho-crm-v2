import { useState } from 'react';

export const useCategoryExpansion = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const isExpanded = (categoryId: string) => expandedCategories.has(categoryId);

  const expandAll = (categoryIds: string[]) => {
    setExpandedCategories(new Set(categoryIds));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  return {
    expandedCategories,
    toggleExpansion,
    isExpanded,
    expandAll,
    collapseAll
  };
};