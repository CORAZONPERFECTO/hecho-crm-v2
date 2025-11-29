
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlySalesData = [
  { name: 'Ene', Ventas: 4000 }, { name: 'Feb', Ventas: 3000 },
  { name: 'Mar', Ventas: 5000 }, { name: 'Abr', Ventas: 4500 },
  { name: 'May', Ventas: 6000 }, { name: 'Jun', Ventas: 5500 },
];

const invoiceStatusData = [
  { name: 'Pagadas', value: 400 },
  { name: 'Pendientes', value: 150 },
  { name: 'Vencidas', value: 50 },
];

const quotationStatusData = [
    { name: 'Aprobadas', value: 250 },
    { name: 'Rechazadas', value: 80 },
    { name: 'Enviadas', value: 120 },
];

const COLORS_INVOICE = ['#16a34a', '#facc15', '#dc2626'];
const COLORS_QUOTATION = ['#16a34a', '#dc2626', '#3b82f6'];

const SalesCharts: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ventas Mensuales (USD)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlySalesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="Ventas" fill="#3b82f6" name="Ventas" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Estado de Facturas</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={invoiceStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {invoiceStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_INVOICE[index % COLORS_INVOICE.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle>Estado de Cotizaciones</CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={quotationStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {quotationStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_QUOTATION[index % COLORS_QUOTATION.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesCharts;
