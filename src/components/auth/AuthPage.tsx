import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, LogIn, UserPlus, Shield } from 'lucide-react';
import { auth, db } from '@/integrations/firebase/client';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  useEffect(() => {
    if (user) {
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(decodeURIComponent(redirectUrl));
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({
          title: "Bienvenido",
          description: "Has iniciado sesión exitosamente.",
        });
        // Navigation handled by useEffect
      } else {
        // Registro
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Las contraseñas no coinciden.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: "Error",
            description: "La contraseña debe tener al menos 6 caracteres.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const newUser = userCredential.user;

        // Crear documento de perfil en Firestore
        await setDoc(doc(db, "users", newUser.uid), {
          id: newUser.uid,
          email: formData.email,
          name: formData.name,
          role: 'technician', // Default role
          status: 'active',
          createdAt: new Date().toISOString()
        });

        toast({
          title: "Registro exitoso",
          description: "Te has registrado exitosamente.",
        });
        // Navigation handled by useEffect
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "Ocurrió un error inesperado.";

      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Email o contraseña incorrectos.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este email ya está registrado.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña es muy débil.";
      }

      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </CardTitle>
          <p className="text-gray-600">
            {isLogin
              ? 'Accede a tu cuenta del sistema de tickets'
              : 'Crea una nueva cuenta para acceder al sistema'
            }
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tu nombre completo"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  required={!isLogin}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isLogin ? 'Iniciando...' : 'Registrando...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </div>
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </p>
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', confirmPassword: '', name: '' });
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              {isLogin ? 'Crear cuenta nueva' : 'Iniciar sesión'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
