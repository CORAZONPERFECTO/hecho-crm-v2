
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, UserCheck, UserX, Key } from 'lucide-react';

interface UserActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onResetPassword: () => void;
  userStatus: 'active' | 'inactive';
}

const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword,
  userStatus,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreVertical size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEdit}>
          <Edit size={14} className="mr-2" />
          Editar Usuario
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleStatus}>
          {userStatus === 'active' ? (
            <>
              <UserX size={14} className="mr-2" />
              Desactivar Usuario
            </>
          ) : (
            <>
              <UserCheck size={14} className="mr-2" />
              Activar Usuario
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onResetPassword}>
          <Key size={14} className="mr-2" />
          Restablecer Contraseña
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 size={14} className="mr-2" />
          Eliminar Usuario
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsMenu;
