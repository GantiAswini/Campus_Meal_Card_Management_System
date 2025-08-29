import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MealCard, Transaction } from '../../types';
import { 
  CreditCard, DollarSign, History, Plus, 
  ArrowUp, ArrowDown, Clock, CheckCircle, 
  AlertTriangle, LogOut, Wallet
} from 'lucide-react';

const StudentApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [card, setCard] = useState<MealCard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeLoading, setRechargeLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    if (!user) return;

    try {
      const [cardData, transactionsData] = await Promise.all([
        api.getStudentCard(user.id),
        api.getStudentTransactions(user.id)
      ]);
      
      setCard(cardData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!card || !rechargeAmount) return;

    const amount = parseFloat(rechargeAmount);
    if (amount <= 0 || amount > 500) return;

    setRechargeLoading(true);
    try {
      await api.createRechargeRequest(card.id, amount);
      setShowRechargeModal(false);
      setRechargeAmount('');
      // Refresh data
      await loadStudentData();
    } catch (error) {
      console.error('Error creating recharge request:', error);
    } finally {
      setRechargeLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 text-gray-900">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">Meal Card</h1>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">
        {/* Student Info */}
        <div className="text-center text-gray-800">
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-gray-500">Student Portal</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 font-medium">Current Balance</span>
            </div>
            <span className="text-sm text-gray-500">{card?.cardNumber}</span>
          </div>
          
          <div className="text-center">
            <p className={`text-4xl font-bold mb-2 ${
              (card?.balance || 0) > 50 ? 'text-green-600' : 
              (card?.balance || 0) > 20 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {formatCurrency(card?.balance || 0)}
            </p>
            
            {(card?.balance || 0) < 20 && (
              <div className="flex items-center justify-center space-x-1 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Low Balance</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowRechargeModal(true)}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Recharge Card</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-gray-800">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Total Recharged</span>
            </div>
            <p className="text-xl font-bold text-blue-700">
              {formatCurrency(
                transactions
                  .filter(t => t.type === 'recharge' && t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 text-gray-800">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowDown className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Total Spent</span>
            </div>
            <p className="text-xl font-bold text-blue-700">
              {formatCurrency(
                transactions
                  .filter(t => t.type === 'meal_purchase' && t.status === 'completed')
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
              )}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No transactions yet</p>
            ) : (
              transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'recharge' 
                        ? 'bg-green-100' 
                        : 'bg-blue-100'
                    }`}>
                      {transaction.type === 'recharge' ? (
                        <ArrowUp className={`w-4 h-4 ${
                          transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {transaction.type === 'recharge' ? 'Card Recharge' : transaction.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                        {transaction.status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                        {transaction.status === 'completed' && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Recharge Card</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recharge Amount
              </label>
              <input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max="500"
                step="0.01"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: $1.00, Maximum: $500.00</p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[20, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setRechargeAmount(amount.toString())}
                  className="py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRechargeModal(false);
                  setRechargeAmount('');
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRecharge}
                disabled={rechargeLoading || !rechargeAmount || parseFloat(rechargeAmount) <= 0}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-colors"
              >
                {rechargeLoading ? 'Processing...' : 'Recharge'}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-3">
              Recharge requests require manager approval
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApp;