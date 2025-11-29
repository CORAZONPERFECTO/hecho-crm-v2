
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";

interface SalesReportFiltersProps {
  cliente: string;
  setCliente: (v: string) => void;
  producto: string;
  setProducto: (v: string) => void;
  date?: Date;
  setDate: (d?: Date) => void;
  clientes: string[];
  productos: string[];
  isFetching: boolean;
  isLoading: boolean;
}

const SalesReportFilters: React.FC<SalesReportFiltersProps> = ({
  cliente,
  setCliente,
  producto,
  setProducto,
  date,
  setDate,
  clientes,
  productos,
  isFetching,
  isLoading,
}) => (
  <div className="bg-gradient-to-r from-blue-50/50 to-blue-100/50 mb-2 rounded-lg">
    <div className="p-4 flex flex-wrap items-center gap-4">
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 font-semibold">Cliente</label>
        <select className="border rounded px-2 py-1" value={cliente} onChange={e => setCliente(e.target.value)}>
          {clientes.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 font-semibold">Producto</label>
        <select className="border rounded px-2 py-1" value={producto} onChange={e => setProducto(e.target.value)}>
          {productos.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="flex flex-col min-w-[150px]">
        <label className="text-xs text-gray-500 font-semibold mb-1">Fecha</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-[150px] justify-start text-left font-normal ${!date ? "text-muted-foreground" : ""}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Seleccionar fecha</span>}
              {(isFetching || isLoading) && (
                <span className="ml-auto animate-spin text-xs mr-2">⏳</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="p-3 pointer-events-auto"
              fromYear={2022}
            />
            <div className="flex justify-end p-2">
              {date && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDate(undefined)}
                  className="text-xs"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </div>
);

export default SalesReportFilters;
