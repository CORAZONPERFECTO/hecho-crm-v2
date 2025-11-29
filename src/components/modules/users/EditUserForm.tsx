import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserData } from './types';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'technician' | 'contador' | 'asistente' | 'supervisor';
  status: 'active' | 'inactive';
}

interface EditUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (userId: string, userData: UserFormData) => void;
  user: UserData | null;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  isOpen,
  onClose,
  onUserUpdated,
  user,
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UserFormData>();
  const { toast } = useToast();
  const watchedRole = watch('role');
  const watchedStatus = watch('status');

  useEffect(() => {
    if (user && isOpen) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('phone', user.phone);
      setValue('role', user.role);
      setValue('status', user.status);
    }
  }, [user, isOpen, setValue]);

  const onSubmit = async (data: UserFormData) => {
    if (!user) return;

    try {
      console.log('Updating user:', user.id, data);
      
      onUserUpdated(user.id, data);
      
      toast({
        title: "Usuario actualizado exitosamente",
        description: `Los datos de ${data.name} han sido actualizados.`,
      });
      
      reset();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error al actualizar usuario",
        description: "Hubo un problema al actualizar el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                {...register('name', { required: 'El nombre es requerido' })}
                placeholder="Ingresa el nombre completo"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo electrónico inválido'
                  }
                })}
                placeholder="usuario@empresa.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                {...register('phone', { required: 'El teléfono es requerido' })}
                placeholder="+506 8888-9999"
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Rol *</Label>
              <Select value={watchedRole} onValueChange={(value) => setValue('role', value as 'admin' | 'manager' | 'technician' | 'contador' | 'asistente' | 'supervisor')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="technician">Técnico</SelectItem>
                  <SelectItem value="contador">Contador</SelectItem>
                  <SelectItem value="asistente">Asistente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Estado *</Label>
              <Select value={watchedStatus} onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Actualizar Usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserForm;
