
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

const IncomeStats: React.FC = () => {
  const stats = [
    {
      title: 'Ingresos del Mes',
      value: '$245,750',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Facturas Pendientes',
      value: '18',
      change: '$45,250',
      changeType: 'neutral',
      icon: FileText,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Facturas Vencidas',
      value: '5',
      change: '$12,800',
      changeType: 'negative',
      icon: AlertTriangle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      title: 'Cotizaciones Activas',
      value: '12',
      change: '$68,500',
      changeType: 'neutral',
      icon: TrendingUp,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Pagos Recibidos Hoy',
      value: '8',
      change: '$15,750',
      changeType: 'positive',
      icon: CreditCard,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Facturación Recurrente',
      value: '24',
      change: 'Próximo: 3 días',
      changeType: 'neutral',
      icon: Calendar,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`${stat.iconColor}`} size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IncomeStats;
