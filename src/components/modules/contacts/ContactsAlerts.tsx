
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { ContactAlert } from './types';

interface ContactsAlertsProps {
  alerts: ContactAlert[];
}

const ContactsAlerts: React.FC<ContactsAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          Alertas Activas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 rounded border-l-4 ${
                alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}
            >
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs text-gray-500">{alert.createdAt}</p>
            </div>
          ))}
          {alerts.length > 3 && (
            <p className="text-sm text-gray-600">+ {alerts.length - 3} alertas más</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactsAlerts;
