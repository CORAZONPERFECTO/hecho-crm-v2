
import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface StatusIconProps {
  status: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  switch (status) {
    case 'open': 
      return <AlertCircle size={16} className="text-red-500" />;
    case 'in-progress': 
      return <Clock size={16} className="text-yellow-500" />;
    case 'resolved': 
      return <CheckCircle size={16} className="text-green-500" />;
    case 'closed': 
      return <CheckCircle size={16} className="text-gray-500" />;
    default: 
      return <AlertCircle size={16} className="text-gray-400" />;
  }
};

export default StatusIcon;
