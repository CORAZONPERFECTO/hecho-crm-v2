
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Crown, UserCheck, Settings } from 'lucide-react';

interface UsersStatsProps {
  totalUsers: number;
  adminUsers: number;
  activeUsers: number;
  technicianUsers: number;
}

const UsersStats: React.FC<UsersStatsProps> = ({ totalUsers, adminUsers, activeUsers, technicianUsers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Usuarios</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
            <User size={24} />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Administradores</p>
              <p className="text-2xl font-bold">{adminUsers}</p>
            </div>
            <Crown size={24} />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Activos</p>
              <p className="text-2xl font-bold">{activeUsers}</p>
            </div>
            <UserCheck size={24} />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Técnicos</p>
              <p className="text-2xl font-bold">{technicianUsers}</p>
            </div>
            <Settings size={24} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersStats;
