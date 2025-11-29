
export interface ResourceFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'guide';
  description?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ResourceCategory {
  id: string;
  name: string;
  manufacturer: string;
  brand: string;
  description?: string;
  files: ResourceFile[];
  createdAt: string;
  isActive: boolean;
}

export interface ResourcesModuleProps {
  userRole: 'admin' | 'technician' | 'manager';
  currentUser: string;
}
