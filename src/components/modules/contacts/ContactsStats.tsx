
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Building,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { ContactAlert } from './types';

interface ContactsStatsProps {
  alerts: ContactAlert[];
}

const ContactsStats: React.FC<ContactsStatsProps> = ({ alerts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Contactos</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <Users size={24} />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Clientes Activos</p>
              <p className="text-2xl font-bold">892</p>
            </div>
            <Building size={24} />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Proveedores</p>
              <p className="text-2xl font-bold">184</p>
            </div>
            <TrendingUp size={24} />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Alertas Pendientes</p>
              <p className="text-2xl font-bold">{alerts.length}</p>
            </div>
            <AlertTriangle size={24} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactsStats;
