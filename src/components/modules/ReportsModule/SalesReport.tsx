
import React, { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import SalesReportFilters from "./SalesReportFilters";
import SalesReportTable from "./SalesReportTable";
import SalesReportKPI from "./SalesReportKPI";

// --- DATOS SIMULADOS
const DEMO_DATA = [
  { id: "001", cliente: "Acme Corp", producto: "Computadora", fecha: "2024-06-01", monto: 1200 },
  { id: "002", cliente: "Beta Ltd", producto: "Impresora", fecha: "2024-06-02", monto: 300 },
  { id: "003", cliente: "Acme Corp", producto: "Mouse", fecha: "2024-06-03", monto: 50 },
  { id: "004", cliente: "Beta Ltd", producto: "Mouse", fecha: "2024-06-04", monto: 40 },
  { id: "005", cliente: "Acme Corp", producto: "Impresora", fecha: "2024-06-04", monto: 250 },
];
const clientes = ["Todos", "Acme Corp", "Beta Ltd"];
const productos = ["Todos", "Computadora", "Impresora", "Mouse"];

async function fetchSalesData({ cliente, producto, date }: { cliente: string; producto: string; date?: Date | undefined }) {
  await new Promise((res) => setTimeout(res, 500));
  let filtered = DEMO_DATA.filter(row =>
    (cliente === "Todos" || row.cliente === cliente) &&
    (producto === "Todos" || row.producto === producto) &&
    (
      !date ||
      row.fecha === format(date, "yyyy-MM-dd")
    )
  );
  // Simular error raro
  if (Math.random() < 0.02) throw new Error("Error al consultar los datos.");
  return filtered;
}

const SalesReport: React.FC = () => {
  const [cliente, setCliente] = useState("Todos");
  const [producto, setProducto] = useState("Todos");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const { data: sales, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["sales", { cliente, producto, date: date ? format(date, "yyyy-MM-dd") : "" }],
    queryFn: () => fetchSalesData({ cliente, producto, date }),
    refetchOnWindowFocus: false,
  });

  const total = sales ? sales.reduce((sum, row) => sum + row.monto, 0) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header y botones */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-blue-500" size={22} />
          Reporte de Ventas
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <Download size={16} className="mr-1" />
            Exportar Excel
          </Button>
          <Button variant="outline" size="sm" disabled>
            <FileText size={16} className="mr-1" />
            Exportar PDF
          </Button>
        </div>
      </header>
      {/* Filtros */}
      <SalesReportFilters
        cliente={cliente}
        setCliente={setCliente}
        producto={producto}
        setProducto={setProducto}
        date={date}
        setDate={setDate}
        clientes={clientes}
        productos={productos}
        isFetching={isFetching}
        isLoading={isLoading}
      />
      {/* KPIs */}
      <SalesReportKPI total={total} isLoading={isLoading} />
      {/* Tabla */}
      <Card>
        <SalesReportTable
          sales={sales}
          isLoading={isLoading}
          isError={isError}
          error={error}
          refetch={refetch}
        />
      </Card>
      <div className="text-xs text-gray-400 text-right mt-2">
        Gráficas y comparativas próximas a agregar — Exportación próximamente
      </div>
    </div>
  );
};

export default SalesReport;
