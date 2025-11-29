
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useTicketTechnicians } from '@/hooks/useTicketTechnicians';

interface TicketFiltersProps {
  filter: string;
  searchTerm: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (search: string) => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({
  filter,
  searchTerm,
  onFilterChange,
  onSearchChange
}) => {
  const { getActiveTechnicians, loading: techniciansLoading, refetch } = useTicketTechnicians();
  const activeTechnicians = getActiveTechnicians();

  // Refetch technicians when component mounts to ensure fresh data
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-300 w-full"
            />
          </div>

          {/* Status Filter */}
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="abierto">Abierto</SelectItem>
              <SelectItem value="en-progreso">En Progreso</SelectItem>
              <SelectItem value="cerrado-pendiente-cotizar">Pendiente Cotizar</SelectItem>
              <SelectItem value="aprobado-factura">Aprobado Factura</SelectItem>
              <SelectItem value="facturado-finalizado">Finalizado</SelectItem>
            </SelectContent>
          </Select>

          {/* Technician Filter */}
          {!techniciansLoading && (
            <Select onValueChange={(value) => onFilterChange(value === 'all-technicians' ? 'all' : value)}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-technicians">Todos</SelectItem>
                {activeTechnicians.map(technician => (
                  <SelectItem key={technician.id} value={technician.name}>
                    {technician.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketFilters;
