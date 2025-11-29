
import React from 'react';
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
import { AlertCircle } from 'lucide-react';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'technician' | 'contador' | 'asistente' | 'supervisor';
  password: string;
}

interface CreateUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: UserFormData) => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UserFormData>();
  const { toast } = useToast();
  const watchedRole = watch('role');

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8) + 'A1!';
    setValue('password', password);
    toast({
      title: "Contraseña generada",
      description: `Contraseña: ${password}`,
    });
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      console.log('Creating user:', data);
      
      onUserCreated(data);
      
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error al crear usuario",
        description: "Hubo un problema al crear el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario con Acceso al Sistema</DialogTitle>
        </DialogHeader>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Este usuario podrá acceder al sistema</p>
              <p>Se creará una cuenta con email y contraseña para que pueda iniciar sesión.</p>
            </div>
          </div>
        </div>
        
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
              <Label htmlFor="email">Correo Electrónico (Usuario) *</Label>
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
              <p className="text-xs text-gray-500 mt-1">
                Este será el usuario para iniciar sesión
              </p>
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
              <Label htmlFor="role">Rol del Usuario *</Label>
              <Select onValueChange={(value) => setValue('role', value as 'admin' | 'manager' | 'technician' | 'contador' | 'asistente' | 'supervisor')}>
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
              {!watchedRole && (
                <p className="text-sm text-red-600 mt-1">El rol es requerido</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Contraseña de Acceso *</Label>
              <div className="flex space-x-2">
                <Input
                  id="password"
                  type="text"
                  {...register('password', { 
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                  placeholder="Contraseña"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={generatePassword}
                  className="whitespace-nowrap"
                >
                  Generar
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Entrégale esta contraseña al usuario para que pueda acceder.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Crear Usuario y Cuenta de Acceso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserForm;
