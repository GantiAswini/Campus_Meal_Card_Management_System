import { User, Student, MealCard, Transaction, Meal } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin',
    name: 'John Admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    email: 'manager@university.edu',
    password: 'manager123',
    role: 'manager',
    name: 'Sarah Manager',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    email: 'cashier@university.edu',
    password: 'cashier123',
    role: 'cashier',
    name: 'Mike Cashier',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    email: 'student@university.edu',
    password: 'student123',
    role: 'student',
    name: 'Emma Student',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '5',
    email: 'alice@university.edu',
    password: 'student123',
    role: 'student',
    name: 'Alice Johnson',
    isActive: true,
    createdAt: '2024-01-02T00:00:00.000Z'
  },
  {
    id: '6',
    email: 'bob@university.edu',
    password: 'student123',
    role: 'student',
    name: 'Bob Wilson',
    isActive: true,
    createdAt: '2024-01-03T00:00:00.000Z'
  }
];

export const mockStudents: Student[] = [
  {
    id: 's1',
    userId: '4',
    studentNumber: 'STU001',
    yearLevel: '3rd Year',
    department: 'Computer Science'
  },
  {
    id: 's2',
    userId: '5',
    studentNumber: 'STU002',
    yearLevel: '2nd Year',
    department: 'Engineering'
  },
  {
    id: 's3',
    userId: '6',
    studentNumber: 'STU003',
    yearLevel: '4th Year',
    department: 'Business'
  }
];

export const mockMealCards: MealCard[] = [
  {
    id: 'c1',
    studentId: 's1',
    cardNumber: 'MC001001',
    balance: 145.50,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastUsed: '2024-01-15T12:30:00.000Z'
  },
  {
    id: 'c2',
    studentId: 's2',
    cardNumber: 'MC001002',
    balance: 89.25,
    isActive: true,
    createdAt: '2024-01-02T00:00:00.000Z',
    lastUsed: '2024-01-15T11:45:00.000Z'
  },
  {
    id: 'c3',
    studentId: 's3',
    cardNumber: 'MC001003',
    balance: 12.75,
    isActive: true,
    createdAt: '2024-01-03T00:00:00.000Z',
    lastUsed: '2024-01-14T13:20:00.000Z'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    cardId: 'c1',
    type: 'recharge',
    amount: 100.00,
    description: 'Card recharge',
    status: 'completed',
    processedBy: '2',
    createdAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: 't2',
    cardId: 'c1',
    type: 'meal_purchase',
    amount: -15.50,
    description: 'Chicken Rice + Drink',
    status: 'completed',
    processedBy: '3',
    createdAt: '2024-01-15T12:30:00.000Z'
  },
  {
    id: 't3',
    cardId: 'c2',
    type: 'recharge',
    amount: 50.00,
    description: 'Card recharge',
    status: 'pending',
    createdAt: '2024-01-15T14:00:00.000Z'
  },
  {
    id: 't4',
    cardId: 'c2',
    type: 'meal_purchase',
    amount: -12.75,
    description: 'Vegetable Curry',
    status: 'completed',
    processedBy: '3',
    createdAt: '2024-01-15T11:45:00.000Z'
  },
  {
    id: 't5',
    cardId: 'c3',
    type: 'recharge',
    amount: 75.00,
    description: 'Card recharge',
    status: 'pending',
    createdAt: '2024-01-15T09:30:00.000Z'
  }
];

export const mockMeals: Meal[] = [
  {
    id: 'm1',
    name: 'Chicken Rice',
    price: 12.50,
    category: 'Main Course',
    isAvailable: true,
    description: 'Steamed chicken with fragrant rice'
  },
  {
    id: 'm2',
    name: 'Beef Noodles',
    price: 15.00,
    category: 'Main Course',
    isAvailable: true,
    description: 'Beef noodle soup with vegetables'
  },
  {
    id: 'm3',
    name: 'Vegetable Curry',
    price: 10.50,
    category: 'Vegetarian',
    isAvailable: true,
    description: 'Mixed vegetables in curry sauce'
  },
  {
    id: 'm4',
    name: 'Fish & Chips',
    price: 18.00,
    category: 'Main Course',
    isAvailable: true,
    description: 'Crispy fish with golden fries'
  },
  {
    id: 'm5',
    name: 'Green Tea',
    price: 3.00,
    category: 'Beverages',
    isAvailable: true,
    description: 'Hot green tea'
  },
  {
    id: 'm6',
    name: 'Fresh Juice',
    price: 4.50,
    category: 'Beverages',
    isAvailable: true,
    description: 'Daily fresh fruit juice'
  }
];