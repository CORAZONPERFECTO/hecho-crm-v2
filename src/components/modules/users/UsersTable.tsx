
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Edit, Trash2, Crown, User, Settings, Shield, ShieldCheck, Calculator, FileText } from 'lucide-react';
import UserActionsMenu from './UserActionsMenu';
import { UserData } from './types';

interface UsersTableProps {
  users: UserData[];
  onEditUser: (user: UserData) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onResetPassword: (userId: string) => void;
}

const getRoleColor = (role: UserData['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'contador': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'asistente': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'technician': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getRoleIcon = (role: UserData['role']) => {
    switch (role) {
      case 'admin': return <Crown size={14} className="text-red-600" />;
      case 'manager': return <Shield size={14} className="text-blue-600" />;
      case 'supervisor': return <ShieldCheck size={14} className="text-cyan-600" />;
      case 'contador': return <Calculator size={14} className="text-yellow-600" />;
      case 'asistente': return <FileText size={14} className="text-purple-600" />;
      case 'technician': return <User size={14} className="text-green-600" />;
      default: return <User size={14} className="text-gray-600" />;
    }
};

const UsersTable: React.FC<UsersTableProps> = ({ users, onEditUser, onDeleteUser, onToggleUserStatus, onResetPassword }) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gray-50 border-b border-gray-100">
        <CardTitle className="text-lg">Lista de Usuarios</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">Usuario</th>
                <th className="text-left p-4 font-semibold text-gray-900">Contacto</th>
                <th className="text-left p-4 font-semibold text-gray-900">Rol</th>
                <th className="text-left p-4 font-semibold text-gray-900">Estado</th>
                <th className="text-left p-4 font-semibold text-gray-900">Último Acceso</th>
                <th className="text-left p-4 font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail size={14} className="text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone size={14} className="text-gray-400" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {user.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {user.lastLogin}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-blue-50"
                        onClick={() => onEditUser(user)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-red-50 text-red-600"
                        onClick={() => onDeleteUser(user.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                      <UserActionsMenu
                        onEdit={() => onEditUser(user)}
                        onDelete={() => onDeleteUser(user.id)}
                        onToggleStatus={() => onToggleUserStatus(user.id)}
                        onResetPassword={() => onResetPassword(user.id)}
                        userStatus={user.status}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersTable;
