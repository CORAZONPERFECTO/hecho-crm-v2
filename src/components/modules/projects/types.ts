
export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  client: string;
  location: string;
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
  assignedBudget: number;
  executedAmount: number;
  assignedTechnicians: string[];
  manager: string;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  documents: ProjectDocument[];
  comments: ProjectComment[];
  milestones: ProjectMilestone[];
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'technical' | 'blueprint' | 'permit' | 'other';
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ProjectComment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  phase?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  receipt?: string;
}

export interface ProjectsModuleProps {
  userRole?: 'admin' | 'technician' | 'manager';
  currentUser?: string;
}
