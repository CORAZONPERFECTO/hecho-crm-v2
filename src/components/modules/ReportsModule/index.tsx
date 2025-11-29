import React, { useState } from "react";
import ReportsSidebar, { sections } from "./ReportsSidebar";
import KPIDashboard from "./KPIDashboard";
import SalesReport from "./SalesReport";
import TechnicalReportsModule from "../reports/TechnicalReportsModule";

// Component stubs for future reports (to be implemented in separados archivos)
const Placeholder = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-5">
    <span className="text-3xl">📊</span>
    <span className="mt-2 text-lg font-bold">{label}</span>
    <span className="text-sm text-gray-400 mt-1">Funcionalidad próximamente...</span>
  </div>
);

const COMPONENTS_MAP: Record<string, React.ReactNode> = {
  dashboard: <KPIDashboard />,
  sales: <SalesReport />,
  tickets: <TechnicalReportsModule />,
  quotations: <Placeholder label="Reporte de Cotizaciones" />,
  recurring: <Placeholder label="Reporte de Facturación Recurrente" />,
  inventory: <Placeholder label="Reporte de Inventario" />,
  projects: <Placeholder label="Reporte de Proyectos" />,
  contacts: <Placeholder label="Reporte de Contactos" />,
  purchases: <Placeholder label="Reporte de Compras" />,
};

const ReportsModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState(sections[0].key);

  return (
    <div className="flex flex-col md:flex-row min-h-[70vh] bg-white rounded-xl shadow-lg overflow-hidden">
      <ReportsSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <section className="flex-1 p-4 md:p-8 overflow-y-auto">
        {COMPONENTS_MAP[activeSection]}
      </section>
    </div>
  );
};

export default ReportsModule;
