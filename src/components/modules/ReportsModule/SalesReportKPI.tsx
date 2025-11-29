
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SalesReportKPIProps {
  total: number;
  isLoading: boolean;
}

const SalesReportKPI: React.FC<SalesReportKPIProps> = ({ total, isLoading }) => (
  <div className="flex gap-4 mb-4">
    <Card className="flex-1 bg-blue-100">
      <CardContent className="p-4">
        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Total Vendido</p>
        <p className="text-2xl font-bold text-blue-900">
          {isLoading ? <span className="animate-pulse text-gray-400">Cargando...</span> : `$${total.toLocaleString()}`}
        </p>
      </CardContent>
    </Card>
    {/* Otros widgets resumen se pueden agregar aquí */}
  </div>
);

export default SalesReportKPI;
