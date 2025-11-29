import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/components/modules/users/types';
import { z } from 'zod';

const userCreateSchema = z.object({
  name: z.string().trim().min(1, { message: 'El nombre es requerido' }).max(100),
  email: z.string().trim().email({ message: 'Correo inválido' }).max(255),
  phone: z.string().trim().max(20).optional(),
  role: z.enum(['admin', 'manager', 'technician', 'contador', 'asistente', 'supervisor']),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }).max(128)
});

const userUpdateSchema = z.object({
  name: z.string().trim().min(1, { message: 'El nombre es requerido' }).max(100),
  email: z.string().trim().email({ message: 'Correo inválido' }).max(255),
  phone: z.string().trim().max(20).optional(),
  role: z.enum(['admin', 'manager', 'technician', 'contador', 'asistente', 'supervisor']),
  status: z.enum(['active', 'inactive'])
});

export const useUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Función para convertir formato Supabase a UserData
  const convertSupabaseToUserData = (supabaseUser: any): UserData => ({
    id: supabaseUser.id,
    name: supabaseUser.name,
    email: supabaseUser.email,
    phone: supabaseUser.phone,
    role: supabaseUser.role,
    status: supabaseUser.status,
    lastLogin: supabaseUser.last_login || 'Nunca'
  });

  // Cargar usuarios desde Supabase profiles
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error al cargar usuarios",
          description: "No se pudieron cargar los usuarios desde la base de datos.",
          variant: "destructive",
        });
        return;
      }

      const convertedUsers = (data || []).map(convertSupabaseToUserData);
      setUsers(convertedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error al cargar usuarios",
        description: "Hubo un problema al conectar con la base de datos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData: any) => {
    try {
      // Validación de entrada (no registrar datos sensibles en logs)
      const parsed = userCreateSchema.safeParse(userData);
      if (!parsed.success) {
        const msg = parsed.error.issues.map(i => i.message).join('\n');
        toast({
          title: 'Datos inválidos',
          description: msg,
          variant: 'destructive',
        });
        return;
      }
      const clean = parsed.data;

      // Obtener sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Error de autenticación',
          description: 'Debes estar autenticado para crear usuarios.',
          variant: 'destructive',
        });
        return;
      }

      // Llamar a la Edge Function para crear usuario
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: clean.email.toLowerCase().trim(),
          password: clean.password,
          name: clean.name,
          phone: clean.phone,
          role: clean.role,
        }
      });

      if (error) {
        console.error('Error calling create-user function:', error);
        toast({
          title: "Error al crear usuario",
          description: "Hubo un problema de conexión. Inténtalo de nuevo.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.success) {
        console.error('Function returned error:', data?.error);
        toast({
          title: "Error al crear usuario",
          description: data?.error || "No se pudo crear el usuario.",
          variant: "destructive",
        });
        return;
      }

      // Update the local users list
      const newUser: UserData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
        status: data.user.status,
        lastLogin: 'Nunca'
      };

      setUsers(prevUsers => [newUser, ...prevUsers]);
      
      toast({
        title: "¡Usuario creado exitosamente!",
        description: `${userData.name} puede acceder con el email: ${userData.email}`,
      });

    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error al crear usuario",
        description: "Hubo un problema inesperado. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      // Validación de entrada
      const parsed = userUpdateSchema.safeParse(userData);
      if (!parsed.success) {
        const msg = parsed.error.issues.map(i => i.message).join('\n');
        toast({
          title: 'Datos inválidos',
          description: msg,
          variant: 'destructive',
        });
        return;
      }
      const clean = parsed.data;

      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: clean.name,
          email: clean.email,
          phone: clean.phone,
          role: clean.role,
          status: clean.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        toast({
          title: "Error al actualizar usuario",
          description: error.message || "No se pudo actualizar el usuario.",
          variant: "destructive",
        });
        return;
      }

      // Actualizar la lista local
      const convertedUser = convertSupabaseToUserData(data);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? convertedUser : user
        )
      );

      toast({
        title: "Usuario actualizado exitosamente",
        description: `Los datos de ${data.name} han sido actualizados.`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error al actualizar usuario",
        description: "Hubo un problema al actualizar el usuario.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // 1. Eliminar usuario de Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Error deleting auth user:', authError);
        toast({
          title: "Error al eliminar usuario",
          description: authError.message || "No se pudo eliminar la cuenta de acceso.",
          variant: "destructive",
        });
        return;
      }

      // 2. El perfil se eliminará automáticamente por CASCADE
      // Actualizar la lista local
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      
      toast({
        title: "Usuario eliminado",
        description: `${user.name} ha sido eliminado del sistema.`,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error al eliminar usuario",
        description: "Hubo un problema al eliminar el usuario.",
        variant: "destructive",
      });
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.status === 'active' ? 'inactive' : 'active';

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling user status:', error);
        toast({
          title: "Error al cambiar estado",
          description: error.message || "No se pudo cambiar el estado del usuario.",
          variant: "destructive",
        });
        return;
      }

      // Actualizar la lista local
      const convertedUser = convertSupabaseToUserData(data);
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? convertedUser : u
        )
      );

      toast({
        title: "Estado actualizado",
        description: `${user.name} ha sido ${newStatus === 'active' ? 'activado' : 'desactivado'}.`,
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error al cambiar estado",
        description: "Hubo un problema al cambiar el estado del usuario.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Generar nueva contraseña temporal
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: tempPassword
      });

      if (error) {
        console.error('Error resetting password:', error);
        toast({
          title: "Error al restablecer contraseña",
          description: error.message || "No se pudo restablecer la contraseña.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Contraseña restablecida",
        description: `Nueva contraseña para ${user.name}: ${tempPassword}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error al restablecer contraseña",
        description: "Hubo un problema al restablecer la contraseña.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    activeUsers: users.filter(u => u.status === 'active').length,
    technicianUsers: users.filter(u => u.role === 'technician').length,
  };

  return {
    filteredUsers,
    searchTerm,
    setSearchTerm,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleUserStatus,
    handleResetPassword,
    stats,
    loading,
    refreshUsers: fetchUsers,
  };
};
