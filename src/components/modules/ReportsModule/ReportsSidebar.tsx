
import React from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Table, Ticket, FileText, ShoppingCart, Users, Repeat, Package, FolderClosed, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Section {
  key: string;
  label: string;
  icon: React.ElementType;
}

const sections: Section[] = [
  { key: "dashboard", label: "Dashboard KPIs", icon: BarChart3 },
  { key: "sales", label: "Reporte de Ventas", icon: ShoppingCart },
  { key: "tickets", label: "Reporte de Tickets", icon: Ticket },
  { key: "quotations", label: "Reporte de Cotizaciones", icon: FileText },
  { key: "recurring", label: "Facturación Recurrente", icon: Repeat },
  { key: "inventory", label: "Inventario", icon: Package },
  { key: "projects", label: "Proyectos", icon: FolderClosed },
  { key: "contacts", label: "Contactos", icon: Users },
  { key: "purchases", label: "Compras", icon: ShoppingCart },
];

interface ReportsSidebarProps {
  activeSection: string;
  onSectionChange: (key: string) => void;
}

const ReportsSidebar: React.FC<ReportsSidebarProps> = ({
  activeSection,
  onSectionChange,
}) => (
  <aside className="bg-gray-50 border-r min-w-[220px] hidden md:flex flex-col py-6 px-3 space-y-2">
    <h2 className="text-xl font-bold mb-6 pl-2 text-gray-800 flex items-center gap-2">
      <BarChart3 size={22} className="text-orange-400" />
      Reportes
    </h2>
    <nav className="space-y-1">
      {sections.map((sec) => (
        <Button
          variant={activeSection === sec.key ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-2",
            activeSection === sec.key ? "bg-orange-100 text-orange-700 font-semibold" : ""
          )}
          key={sec.key}
          onClick={() => onSectionChange(sec.key)}
        >
          <sec.icon size={18} />
          {sec.label}
        </Button>
      ))}
    </nav>
  </aside>
);

export default ReportsSidebar;
export type { Section };
export { sections };
