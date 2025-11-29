
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ProfitFiltersProps {
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
  excludeFromAnalysis: boolean;
  onExcludeChange: (exclude: boolean) => void;
}

const ProfitFilters: React.FC<ProfitFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  excludeFromAnalysis,
  onExcludeChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros de Análisis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Fecha Desde</Label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Fecha Hasta</Label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="exclude"
              checked={excludeFromAnalysis}
              onCheckedChange={onExcludeChange}
            />
            <Label htmlFor="exclude">
              Excluir tickets marcados como cortesía
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitFilters;
