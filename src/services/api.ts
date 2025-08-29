import { 
  User, Student, MealCard, Transaction, Meal, DashboardStats 
} from '../types';
import { 
  mockUsers, mockStudents, mockMealCards, mockTransactions, mockMeals 
} from '../data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Data storage (simulating backend)
let users = [...mockUsers];
let students = [...mockStudents];
let mealCards = [...mockMealCards];
let transactions = [...mockTransactions];
let meals = [...mockMeals];

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<User | null> {
    await delay(500);
    const user = users.find(u => u.email === email && u.password === password && u.isActive);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }
    return null;
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    await delay(300);
    const totalStudents = students.length;
    const totalBalance = mealCards.reduce((sum, card) => sum + card.balance, 0);
    const totalTransactions = transactions.length;
    const pendingRecharges = transactions.filter(t => t.type === 'recharge' && t.status === 'pending').length;
    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = transactions
      .filter(t => t.createdAt.startsWith(today) && t.type === 'meal_purchase' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const activeCards = mealCards.filter(card => card.isActive).length;

    return {
      totalStudents,
      totalBalance,
      totalTransactions,
      pendingRecharges,
      todayRevenue,
      activeCards
    };
  },

  // Students
  async getStudents(): Promise<(Student & { name: string; email: string; cardBalance: number })[]> {
    await delay(300);
    return students.map(student => {
      const user = users.find(u => u.id === student.userId);
      const card = mealCards.find(c => c.studentId === student.id);
      return {
        ...student,
        name: user?.name || 'Unknown',
        email: user?.email || 'Unknown',
        cardBalance: card?.balance || 0
      };
    });
  },

  async getStudentByCardNumber(cardNumber: string): Promise<(Student & { name: string; cardBalance: number; cardId: string }) | null> {
    await delay(200);
    const card = mealCards.find(c => c.cardNumber === cardNumber && c.isActive);
    if (!card) return null;

    const student = students.find(s => s.id === card.studentId);
    if (!student) return null;

    const user = users.find(u => u.id === student.userId);
    return {
      ...student,
      name: user?.name || 'Unknown',
      cardBalance: card.balance,
      cardId: card.id
    };
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    await delay(300);
    return transactions.map(transaction => {
      const card = mealCards.find(c => c.id === transaction.cardId);
      const student = students.find(s => s.id === card?.studentId);
      const user = users.find(u => u.id === student?.userId);
      
      return {
        ...transaction,
        studentName: user?.name || 'Unknown',
        cardNumber: card?.cardNumber || 'Unknown'
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getPendingRecharges(): Promise<Transaction[]> {
    await delay(300);
    const pendingRecharges = transactions.filter(t => t.type === 'recharge' && t.status === 'pending');
    
    return pendingRecharges.map(transaction => {
      const card = mealCards.find(c => c.id === transaction.cardId);
      const student = students.find(s => s.id === card?.studentId);
      const user = users.find(u => u.id === student?.userId);
      
      return {
        ...transaction,
        studentName: user?.name || 'Unknown',
        cardNumber: card?.cardNumber || 'Unknown'
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getStudentTransactions(userId: string): Promise<Transaction[]> {
    await delay(300);
    const student = students.find(s => s.userId === userId);
    if (!student) return [];

    const card = mealCards.find(c => c.studentId === student.id);
    if (!card) return [];

    return transactions
      .filter(t => t.cardId === card.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async approveRecharge(transactionId: string, managerId: string): Promise<boolean> {
    await delay(500);
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) return false;

    const transaction = transactions[transactionIndex];
    if (transaction.type !== 'recharge' || transaction.status !== 'pending') return false;

    // Update transaction
    transactions[transactionIndex] = {
      ...transaction,
      status: 'completed',
      processedBy: managerId
    };

    // Update card balance
    const cardIndex = mealCards.findIndex(c => c.id === transaction.cardId);
    if (cardIndex !== -1) {
      mealCards[cardIndex] = {
        ...mealCards[cardIndex],
        balance: mealCards[cardIndex].balance + transaction.amount
      };
    }

    return true;
  },

  async rejectRecharge(transactionId: string, managerId: string): Promise<boolean> {
    await delay(500);
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) return false;

    const transaction = transactions[transactionIndex];
    if (transaction.type !== 'recharge' || transaction.status !== 'pending') return false;

    transactions[transactionIndex] = {
      ...transaction,
      status: 'rejected',
      processedBy: managerId
    };

    return true;
  },

  async createRechargeRequest(cardId: string, amount: number): Promise<string> {
    await delay(500);
    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      cardId,
      type: 'recharge',
      amount,
      description: 'Card recharge',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    transactions.push(newTransaction);
    return newTransaction.id;
  },

  async processMealPurchase(cardId: string, amount: number, description: string, cashierId: string): Promise<boolean> {
    await delay(500);
    const cardIndex = mealCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;

    const card = mealCards[cardIndex];
    if (card.balance < amount) return false;

    // Update card balance
    mealCards[cardIndex] = {
      ...card,
      balance: card.balance - amount,
      lastUsed: new Date().toISOString()
    };

    // Create transaction record
    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      cardId,
      type: 'meal_purchase',
      amount: -amount,
      description,
      status: 'completed',
      processedBy: cashierId,
      createdAt: new Date().toISOString()
    };

    transactions.push(newTransaction);
    return true;
  },

  // Meals
  async getMeals(): Promise<Meal[]> {
    await delay(300);
    return meals.filter(meal => meal.isAvailable);
  },

  // Get student's meal card
  async getStudentCard(userId: string): Promise<MealCard | null> {
    await delay(300);
    const student = students.find(s => s.userId === userId);
    if (!student) return null;

    return mealCards.find(c => c.studentId === student.id) || null;
  }
};