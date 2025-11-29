import { useState, useEffect, createContext, useContext } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'technician' | 'contador' | 'asistente' | 'supervisor';
  status: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => { },
  refreshProfile: async () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Profile;
      } else {
        console.log('No such profile document!');
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.uid);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        let profileData = await fetchProfile(currentUser.uid);

        if (!profileData) {
          console.log('Profile missing, creating new profile for:', currentUser.email);
          try {
            const newProfile: Profile = {
              id: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario',
              email: currentUser.email || '',
              role: 'technician', // Default role
              status: 'active'
            };

            await setDoc(doc(db, 'users', currentUser.uid), newProfile);
            profileData = newProfile;

            toast({
              title: "Perfil creado",
              description: "Se ha creado tu perfil de usuario automáticamente.",
            });
          } catch (error) {
            console.error('Error creating profile:', error);
            toast({
              title: "Error",
              description: "No se pudo crear el perfil de usuario.",
              variant: "destructive",
            });
          }
        }

        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al cerrar la sesión.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
