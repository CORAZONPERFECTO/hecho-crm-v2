
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingUp, BarChart3, Users, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

type KPI = {
  id: string;
  icon: React.ElementType;
  label: string;
  value: string;
  note: string;
  color: string;
};

const DefaultKpis: KPI[] = [
  {
    id: "sales-this-month",
    icon: TrendingUp,
    label: "Ventas del mes",
    value: "$123,456",
    note: "vs anterior: +13%",
    color: "bg-gradient-to-br from-green-400 to-green-600",
  },
  {
    id: "conversion-rate",
    icon: BarChart3,
    label: "Tasa de conversión",
    value: "54%",
    note: "Cotizaciones a ventas",
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
  },
  {
    id: "tickets-close-time",
    icon: Timer,
    label: "Promedio de cierre de tickets",
    value: "2d 3h",
    note: "Este mes",
    color: "bg-gradient-to-br from-orange-400 to-orange-600",
  },
  {
    id: "active-customers",
    icon: Users,
    label: "Clientes activos",
    value: "92",
    note: "Contra inactivos: 8",
    color: "bg-gradient-to-br from-purple-400 to-purple-600",
  }
];

const KPIDashboard = () => {
  const [kpis, setKpis] = useState(DefaultKpis);

  const handleAddKpi = () => {
    // Futuro: aquí se abrirá modal para agregar KPI personalizados
    alert("Funcionalidad para agregar KPIs personalizada próximamente");
  };

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard de KPIs</h1>
        <Button
          onClick={handleAddKpi}
          variant="outline"
          className=" gap-2"
        >
          <Plus size={18} />
          Nuevo KPI
        </Button>
      </header>
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="shadow-sm animate-fade-in">
            <CardContent className="flex gap-4 items-center p-5">
              <div className={`rounded-lg w-14 h-14 flex items-center justify-center ${kpi.color} text-white`}>
                <kpi.icon size={30} />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">{kpi.label}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.note}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-gray-400 text-xs text-center">Arrastra para reordenar (proximamente) • Personaliza tus KPIs favoritos</div>
    </div>
  );
};

export default KPIDashboard;
