import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { supabase } from '@/integrations/supabase/client';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manager' | 'technician' | 'contador' | 'asistente' | 'supervisor')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="text-lg font-medium">Verificando autenticación...</p>
            <div className="mt-4 w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    // Preservar la URL actual para redirigir después del login
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirectUrl}`} replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Shield className="w-16 h-16 text-orange-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Perfil</h2>
            <p className="text-gray-600 mb-4">
              No se pudo cargar tu información de perfil. Por favor, intenta recargar o inicia sesión nuevamente.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Recargar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // Usar window.location.href para forzar recarga limpia
                  window.location.href = '/auth';
                }}
              >
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile.status === 'inactive') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cuenta Inactiva</h2>
            <p className="text-gray-600 mb-4">
              Tu cuenta ha sido desactivada. Contacta al administrador para más información.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirigir técnicos a su página específica
  if (profile.role === 'technician' && location.pathname === '/') {
    return <Navigate to="/technician" replace />;
  }

  // Redirigir otros roles a la página principal si intentan acceder a /technician
  // MODIFICADO: Permitir acceso a admin también para debugging/verificación
  if (profile.role !== 'technician' && profile.role !== 'admin' && location.pathname === '/technician') {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Shield className="w-16 h-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder a esta sección.
            </p>
            <p className="text-sm text-gray-500">
              Tu rol: <span className="font-medium">{profile.role}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
