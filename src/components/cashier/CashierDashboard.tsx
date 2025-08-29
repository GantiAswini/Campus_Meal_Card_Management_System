import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Student, Meal, Transaction } from '../../types';
import { 
  Search, DollarSign, Clock, CreditCard, 
  AlertCircle, CheckCircle, ShoppingCart, Coffee,
  Zap, Filter, Plus, Minus, X, ChefHat, Utensils
} from 'lucide-react';

// Sample meal data with images (in a real app, this would come from your API)
const sampleMeals: Meal[] = [
  {
    id: '1',
    name: 'Cheeseburger',
    description: 'Juicy beef patty with cheese, lettuce, and special sauce',
    price: 199,
    category: 'Main Course',
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing and croutons',
    price: 149,
    category: 'Salads',
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '3',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    price: 299,
    category: 'Main Course',
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '4',
    name: 'French Fries',
    description: 'Crispy golden fries with a pinch of salt',
    price: 99,
    category: 'Sides',
    isPopular: true,
    image: 'https://tse4.mm.bing.net/th/id/OIP.YtKZjv5Zw5IjZN6deRDrUQHaE8?pid=Api&P=0&h=180'
  },
  {
    id: '5',
    name: 'Chocolate Shake',
    description: 'Creamy chocolate milkshake topped with whipped cream',
    price: 149,
    category: 'Beverages',
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '6',
    name: 'Vegetable Biryani',
    description: 'Fragrant rice cooked with mixed vegetables and spices',
    price: 249,
    category: 'Main Course',
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '7',
    name: 'Samosa',
    description: 'Crispy pastry filled with spiced potatoes and peas',
    price: 79,
    category: 'Snacks',
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '8',
    name: 'Masala Chai',
    description: 'Spiced Indian tea with milk and aromatic spices',
    price: 49,
    category: 'Beverages',
    isPopular: true,
    image: 'https://tse2.mm.bing.net/th/id/OIP.q9LEcSQcyOhlLu9x8T-_YwHaE8?pid=Api&P=0&h=180'
  }
];

const CashierDashboard: React.FC = () => {
  const { user } = useAuth();
  const [cardNumber, setCardNumber] = useState('');
  const [student, setStudent] = useState<(Student & { name: string; cardBalance: number; cardId: string }) | null>(null);
  const [meals, setMeals] = useState<Meal[]>(sampleMeals);
  const [selectedMeals, setSelectedMeals] = useState<{ meal: Meal; quantity: number }[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [customAmount, setCustomAmount] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRushMode, setIsRushMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  const loadRecentTransactions = async () => {
    try {
      const transactions = await api.getTransactions();
      setRecentTransactions(transactions.filter(t => t.type === 'meal_purchase').slice(0, 10));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const searchStudent = async () => {
    if (!cardNumber.trim()) return;

    setLoading(true);
    try {
      const studentData = await api.getStudentByCardNumber(cardNumber);
      setStudent(studentData);
      if (!studentData) {
        setMessage({ type: 'error', text: 'Card not found or inactive' });
      } else {
        setMessage(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching for student' });
    } finally {
      setLoading(false);
    }
  };

  const addMeal = (meal: Meal) => {
    setSelectedMeals(prev => {
      const existing = prev.find(item => item.meal.id === meal.id);
      if (existing) {
        return prev.map(item => 
          item.meal.id === meal.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { meal, quantity: 1 }];
    });
  };

  const removeMeal = (mealId: string) => {
    setSelectedMeals(prev => prev.filter(item => item.meal.id !== mealId));
  };

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity <= 0) {
      removeMeal(mealId);
      return;
    }
    setSelectedMeals(prev => 
      prev.map(item => 
        item.meal.id === mealId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getTotalAmount = () => {
    const mealTotal = selectedMeals.reduce((sum, item) => sum + (item.meal.price * item.quantity), 0);
    const customTotal = customAmount ? parseFloat(customAmount) : 0;
    return mealTotal + customTotal;
  };

  const processTransaction = async () => {
    if (!student || !user) return;

    const totalAmount = getTotalAmount();
    if (totalAmount <= 0) {
      setMessage({ type: 'error', text: 'Please select items or enter an amount' });
      return;
    }

    if (student.cardBalance < totalAmount) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }

    setLoading(true);
    try {
      let description = '';
      if (selectedMeals.length > 0) {
        description = selectedMeals.map(item => `${item.meal.name} x${item.quantity}`).join(', ');
      }
      if (customDescription) {
        description = description ? `${description}, ${customDescription}` : customDescription;
      }

      const success = await api.processMealPurchase(
        student.cardId,
        totalAmount,
        description || 'Meal purchase',
        user.id
      );

      if (success) {
        setMessage({ type: 'success', text: `Transaction completed! Charged ₹${totalAmount.toFixed(2)}` });
        // Refresh student data
        const updatedStudent = await api.getStudentByCardNumber(cardNumber);
        setStudent(updatedStudent);
        // Clear selections
        setSelectedMeals([]);
        setCustomAmount('');
        setCustomDescription('');
        // Refresh recent transactions
        loadRecentTransactions();
      } else {
        setMessage({ type: 'error', text: 'Transaction failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error processing transaction' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group meals by category
  const mealsByCategory = meals.reduce((acc, meal) => {
    const category = meal.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  // Get all categories
  const categories = ['All', ...Object.keys(mealsByCategory)];

  // Filter meals based on active category and search term
  const filteredMeals = activeCategory === 'All' 
    ? meals 
    : mealsByCategory[activeCategory] || [];

  const searchedMeals = searchTerm 
    ? filteredMeals.filter(meal => 
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchTerm.toLowerCase()))
    : filteredMeals;

  // Get popular meals
  const popularMeals = meals.filter(meal => meal.isPopular);

  return (
    <Layout title="Cashier Terminal">
      <div className="space-y-6">
        {/* Student Search */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Student Lookup
            </h3>
            <button
              onClick={() => setIsRushMode(!isRushMode)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                isRushMode 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Zap className="w-4 h-4 mr-1" />
              {isRushMode ? 'Rush Mode ON' : 'Rush Mode'}
            </button>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter card number (e.g., MC001001)"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchStudent()}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={searchStudent}
              disabled={loading || !cardNumber.trim()}
              className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

          {/* Student Info */}
          {student && (
            <div className={`mt-6 rounded-lg p-4 ${isRushMode ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
              <div className={isRushMode ? "flex justify-between items-center" : "grid grid-cols-1 md:grid-cols-3 gap-4"}>
                <div className={isRushMode ? "text-center" : ""}>
                  <p className="text-sm text-gray-600">Student Name</p>
                  <p className={`font-semibold ${isRushMode ? 'text-2xl' : 'text-lg'}`}>
                    {student.name}
                  </p>
                </div>
                <div className={isRushMode ? "text-center" : ""}>
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className={`font-bold ${isRushMode ? 'text-3xl' : 'text-xl'} ${
                    student.cardBalance > 500 ? 'text-green-600' : 
                    student.cardBalance > 200 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(student.cardBalance)}
                  </p>
                </div>
                {!isRushMode && (
                  <div>
                    <p className="text-sm text-gray-600">Student Number</p>
                    <p className="font-semibold text-lg">{student.studentNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {student && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meal Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Utensils className="w-5 h-5 mr-2" />
                  Menu Items
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search meals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Select Popular Items */}
              {popularMeals.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Popular Items</h4>
                  <div className="flex flex-wrap gap-2">
                    {popularMeals.map(meal => (
                      <button
                        key={meal.id}
                        onClick={() => addMeal(meal)}
                        className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        {meal.name} (+{formatCurrency(meal.price)})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                {searchedMeals.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <Coffee className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No meals found</p>
                  </div>
                ) : (
                  searchedMeals.map((meal) => (
                    <div key={meal.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={meal.image} 
                          alt={meal.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-gray-900">{meal.name}</h4>
                          <span className="font-semibold text-purple-600">{formatCurrency(meal.price)}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 h-10 overflow-hidden">{meal.description}</p>
                        <button
                          onClick={() => addMeal(meal)}
                          className="w-full py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Custom Item */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Custom Item</h4>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    step="1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Summary
              </h3>
              
              {selectedMeals.length === 0 && !customAmount ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No items selected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Meals */}
                  {selectedMeals.map((item) => (
                    <div key={item.meal.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded overflow-hidden">
                          <img 
                            src={item.meal.image} 
                            alt={item.meal.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.meal.name}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.meal.price)} each</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.meal.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-l-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.meal.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-r-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right min-w-20">
                          <p className="font-semibold">{formatCurrency(item.meal.price * item.quantity)}</p>
                          <button
                            onClick={() => removeMeal(item.meal.id)}
                            className="text-red-500 text-sm hover:text-red-700 flex items-center justify-end w-full mt-1"
                          >
                            <X className="w-3 h-3 mr-1" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Custom Item */}
                  {customAmount && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{customDescription || 'Custom Item'}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className="font-semibold">{formatCurrency(parseFloat(customAmount))}</p>
                        <button
                          onClick={() => {
                            setCustomAmount('');
                            setCustomDescription('');
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold">Total</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {formatCurrency(getTotalAmount())}
                      </span>
                    </div>
                    
                    {student.cardBalance >= getTotalAmount() ? (
                      <button
                        onClick={processTransaction}
                        disabled={loading}
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Processing...' : `Charge ${formatCurrency(getTotalAmount())}`}
                      </button>
                    ) : (
                      <div className="text-center">
                        <p className="text-red-600 font-medium mb-2">Insufficient Balance</p>
                        <p className="text-sm text-gray-600">
                          Need {formatCurrency(getTotalAmount() - student.cardBalance)} more
                        </p>
                        <button className="w-full py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed">
                          Cannot Process
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Transactions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.studentName}</div>
                        <div className="text-sm text-gray-500">{transaction.cardNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-red-600">
                        -{formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CashierDashboard;