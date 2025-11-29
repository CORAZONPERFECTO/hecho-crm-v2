
export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'technician' | 'contador' | 'asistente' | 'supervisor';
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar?: string;
}
