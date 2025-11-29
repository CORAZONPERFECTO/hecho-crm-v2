
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface UsersHeaderProps {
  onNewUserClick: () => void;
}

const UsersHeader: React.FC<UsersHeaderProps> = ({ onNewUserClick }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600">Administra usuarios, roles y permisos del sistema</p>
      </div>
      <Button 
        onClick={onNewUserClick}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
      >
        <UserPlus size={20} className="mr-2" />
        Nuevo Usuario
      </Button>
    </div>
  );
};

export default UsersHeader;
