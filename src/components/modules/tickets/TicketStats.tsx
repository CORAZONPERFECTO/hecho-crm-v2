
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Clock, CheckCircle, FileText } from 'lucide-react';
import { Ticket } from './types';

interface TicketStatsProps {
  tickets: Ticket[];
}

const TicketStats: React.FC<TicketStatsProps> = ({ tickets }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Abiertos</p>
              <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'abierto').length}</p>
            </div>
            <AlertCircle size={24} />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">En Progreso</p>
              <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'en-progreso').length}</p>
            </div>
            <Clock size={24} />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Pend. Cotizar</p>
              <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'cerrado-pendiente-cotizar').length}</p>
            </div>
            <FileText size={24} />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Aprobados</p>
              <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'aprobado-factura').length}</p>
            </div>
            <CheckCircle size={24} />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Facturados</p>
              <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'facturado-finalizado').length}</p>
            </div>
            <CheckCircle size={24} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketStats;
