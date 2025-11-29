
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SalesRow {
  id: string;
  cliente: string;
  producto: string;
  fecha: string;
  monto: number;
}

interface SalesReportTableProps {
  sales?: SalesRow[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
}

const SalesReportTable: React.FC<SalesReportTableProps> = ({
  sales,
  isLoading,
  isError,
  error,
  refetch
}) => (
  <div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N°</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-400 py-8">
              Cargando datos...
            </TableCell>
          </TableRow>
        ) : isError ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-red-500 py-8">
              Error al cargar datos. <Button variant="outline" size="sm" onClick={refetch}>Reintentar</Button>
            </TableCell>
          </TableRow>
        ) : sales && sales.length > 0 ? (
          sales.map((row) => (
            <TableRow key={row.id}
              className="hover:bg-blue-50 transition"
              title="Ver detalles del reporte"
              style={{ userSelect: "none", cursor: "pointer" }}
            >
              <TableCell colSpan={5} className="p-0">
                <a
                  href={`/reportes/ventas/${row.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full h-full px-4 py-3 items-center gap-0 text-inherit no-underline hover:underline"
                  tabIndex={0}
                  style={{ minHeight: "100%" }}
                  onClick={e => {
                    e.stopPropagation();
                  }}
                >
                  <span className="w-[10%]">{row.id}</span>
                  <span className="w-[30%]">{row.cliente}</span>
                  <span className="w-[20%]">{row.producto}</span>
                  <span className="w-[20%]">{row.fecha}</span>
                  <span className="w-[20%] font-semibold text-right">${row.monto.toLocaleString()}</span>
                </a>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-400 py-8">
              No hay datos para los filtros seleccionados.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

export default SalesReportTable;
