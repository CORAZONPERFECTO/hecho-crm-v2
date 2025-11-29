
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AccountingReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [startDate, setStartDate] = useState('2024-06-01');
  const [endDate, setEndDate] = useState('2024-06-30');
  const { toast } = useToast();

  const reportTypes = [
    { id: 'income-expenses', name: 'Ingresos y Gastos', icon: BarChart3, description: 'Resumen detallado de ingresos y gastos por período' },
    { id: 'balance-sheet', name: 'Balance General', icon: PieChart, description: 'Estado de situación financiera de la empresa' },
    { id: 'cash-flow', name: 'Flujo de Caja', icon: TrendingUp, description: 'Movimientos de efectivo entrante y saliente' },
    { id: 'suppliers-payments', name: 'Proveedores vs Pagos', icon: FileText, description: 'Análisis de pagos a proveedores' },
    { id: 'tax-report', name: 'Reporte de Impuestos', icon: FileText, description: 'ITBIS facturado, retenido y por pagar' }
  ];

  const sampleReportData = {
    'income-expenses': {
      totalIncome: 125750,
      totalExpenses: 78250,
      netProfit: 47500,
      categories: [
        { name: 'Servicios Técnicos', income: 85000, expenses: 15000 },
        { name: 'Venta Equipos', income: 40750, expenses: 25000 },
        { name: 'Materiales', income: 0, expenses: 38250 }
      ]
    },
    'balance-sheet': {
      assets: 285000,
      liabilities: 45000,
      equity: 240000,
      items: [
        { category: 'Activos Corrientes', amount: 125000 },
        { category: 'Activos Fijos', amount: 160000 },
        { category: 'Pasivos Corrientes', amount: 35000 },
        { category: 'Pasivos a Largo Plazo', amount: 10000 }
      ]
    },
    'cash-flow': {
      operatingCashFlow: 52000,
      investingCashFlow: -15000,
      financingCashFlow: -8000,
      netCashFlow: 29000
    },
    'suppliers-payments': [
      { supplier: 'Ferretería Central', totalBilled: 25000, totalPaid: 20000, pending: 5000 },
      { supplier: 'Distribuidora Tech', totalBilled: 18500, totalPaid: 18500, pending: 0 },
      { supplier: 'Servicios Públicos', totalBilled: 3600, totalPaid: 3600, pending: 0 }
    ],
    'tax-report': {
      itbisBilled: 15975,
      itbisRetained: 2100,
      itbisToPay: 13875,
      period: '2024-06'
    }
  };

  const handleGenerateReport = () => {
    if (!selectedReport) {
      toast({
        title: "Selecciona un tipo de reporte",
        description: "Por favor selecciona el tipo de reporte que deseas generar.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reporte generado exitosamente",
      description: `El reporte de ${reportTypes.find(r => r.id === selectedReport)?.name} ha sido generado.`,
    });
  };

  const handleExportReport = (format: string) => {
    toast({
      title: `Exportando en ${format.toUpperCase()}`,
      description: "Tu reporte será descargado en breve.",
    });
  };

  const renderReportPreview = () => {
    if (!selectedReport) return null;

    const data = sampleReportData[selectedReport as keyof typeof sampleReportData];

    switch (selectedReport) {
      case 'income-expenses':
        const incomeExpensesData = data as typeof sampleReportData['income-expenses'];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">Total Ingresos</p>
                <p className="text-2xl font-bold text-green-800">${incomeExpensesData.totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">Total Gastos</p>
                <p className="text-2xl font-bold text-red-800">${incomeExpensesData.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">Ganancia Neta</p>
                <p className="text-2xl font-bold text-blue-800">${incomeExpensesData.netProfit.toLocaleString()}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Categoría</th>
                    <th className="border border-gray-300 p-2 text-right">Ingresos</th>
                    <th className="border border-gray-300 p-2 text-right">Gastos</th>
                    <th className="border border-gray-300 p-2 text-right">Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeExpensesData.categories.map((category, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{category.name}</td>
                      <td className="border border-gray-300 p-2 text-right text-green-600">${category.income.toLocaleString()}</td>
                      <td className="border border-gray-300 p-2 text-right text-red-600">${category.expenses.toLocaleString()}</td>
                      <td className="border border-gray-300 p-2 text-right font-bold">${(category.income - category.expenses).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'suppliers-payments':
        const suppliersData = data as typeof sampleReportData['suppliers-payments'];
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">Proveedor</th>
                  <th className="border border-gray-300 p-2 text-right">Total Facturado</th>
                  <th className="border border-gray-300 p-2 text-right">Total Pagado</th>
                  <th className="border border-gray-300 p-2 text-right">Pendiente</th>
                  <th className="border border-gray-300 p-2 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {suppliersData.map((supplier, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{supplier.supplier}</td>
                    <td className="border border-gray-300 p-2 text-right">${supplier.totalBilled.toLocaleString()}</td>
                    <td className="border border-gray-300 p-2 text-right text-green-600">${supplier.totalPaid.toLocaleString()}</td>
                    <td className="border border-gray-300 p-2 text-right text-red-600">${supplier.pending.toLocaleString()}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      <Badge className={supplier.pending === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {supplier.pending === 0 ? 'Al día' : 'Pendiente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Vista previa del reporte seleccionado aparecerá aquí
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Reportes Contables</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <Download size={16} className="mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('excel')}>
            <Download size={16} className="mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter size={20} />
              Configuración del Reporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="report-type">Tipo de Reporte</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar reporte" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-date">Fecha Inicio</Label>
              <Input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end-date">Fecha Fin</Label>
              <Input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={handleGenerateReport}
            >
              <BarChart3 size={16} className="mr-2" />
              Generar Reporte
            </Button>
          </CardContent>
        </Card>

        {/* Report Types Grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Tipos de Reportes Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((report) => {
                const IconComponent = report.icon;
                return (
                  <div
                    key={report.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedReport === report.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent 
                        size={24} 
                        className={selectedReport === report.id ? 'text-blue-600' : 'text-gray-600'} 
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">{report.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Vista Previa del Reporte - {reportTypes.find(r => r.id === selectedReport)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderReportPreview()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountingReports;
