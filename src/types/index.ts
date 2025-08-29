export type UserRole = 'admin' | 'manager' | 'cashier' | 'student';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  studentNumber: string;
  yearLevel: string;
  department: string;
}

export interface MealCard {
  id: string;
  studentId: string;
  cardNumber: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface Transaction {
  id: string;
  cardId: string;
  type: 'recharge' | 'meal_purchase';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  processedBy?: string;
  createdAt: string;
  studentName?: string;
  cardNumber?: string;
}

export interface Meal {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  description: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalBalance: number;
  totalTransactions: number;
  pendingRecharges: number;
  todayRevenue: number;
  activeCards: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}