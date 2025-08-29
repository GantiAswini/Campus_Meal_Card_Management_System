
import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import { api } from '../../services/api';
import { DashboardStats, Student, Transaction } from '../../types';
import { 
  Users, CreditCard, DollarSign, Clock, 
  TrendingUp, Activity, BarChart3, Search,
  Filter, Download, Eye, MoreHorizontal,
  ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  Settings, FileText, UserCog, X, Save, RefreshCw,
  Shield, CreditCard as Card, Coins, Receipt, Plus, AlertCircle
} from 'lucide-react';

// Define types for our new features
type SortField = 'name' | 'email' | 'cardBalance' | 'studentNumber' | 'department';
type SortOrder = 'asc' | 'desc';
type TransactionType = 'all' | 'recharge' | 'purchase';
type TransactionStatus = 'all' | 'completed' | 'pending' | 'failed';

// System settings types
interface SystemSettings {
  transactionFee: number;
  minimumBalance: number;
  maximumBalance: number;
  autoRecharge: boolean;
  lowBalanceAlert: number;
  cardReplacementFee: number;
  dailySpendingLimit: number;
  systemMaintenanceMode: boolean;
  currency: string;
  receiptPrinting: boolean;
}

// Additional student data - Expanded with more students
const additionalStudents = [
  {
    id: '1001',
    name: 'Emma Johnson',
    email: 'emma.johnson@university.edu',
    studentNumber: 'S1001',
    department: 'Computer Science',
    cardBalance: 45.75,
    cardStatus: 'active'
  },
  {
    id: '1002',
    name: 'Michael Chen',
    email: 'michael.chen@university.edu',
    studentNumber: 'S1002',
    department: 'Engineering',
    cardBalance: 12.50,
    cardStatus: 'active'
  },
  {
    id: '1003',
    name: 'Sarah Williams',
    email: 'sarah.williams@university.edu',
    studentNumber: 'S1003',
    department: 'Business',
    cardBalance: 78.20,
    cardStatus: 'active'
  },
  {
    id: '1004',
    name: 'David Kim',
    email: 'david.kim@university.edu',
    studentNumber: 'S1004',
    department: 'Mathematics',
    cardBalance: 5.00,
    cardStatus: 'active'
  },
  {
    id: '1005',
    name: 'Olivia Martinez',
    email: 'olivia.martinez@university.edu',
    studentNumber: 'S1005',
    department: 'Physics',
    cardBalance: 32.00,
    cardStatus: 'active'
  },
  // Added more students
  {
    id: '1006',
    name: 'James Wilson',
    email: 'james.wilson@university.edu',
    studentNumber: 'S1006',
    department: 'Chemistry',
    cardBalance: 67.80,
    cardStatus: 'active'
  },
  {
    id: '1007',
    name: 'Sophia Brown',
    email: 'sophia.brown@university.edu',
    studentNumber: 'S1007',
    department: 'Biology',
    cardBalance: 23.45,
    cardStatus: 'active'
  },
  {
    id: '1008',
    name: 'William Taylor',
    email: 'william.taylor@university.edu',
    studentNumber: 'S1008',
    department: 'Economics',
    cardBalance: 89.10,
    cardStatus: 'active'
  },
  {
    id: '1009',
    name: 'Isabella Anderson',
    email: 'isabella.anderson@university.edu',
    studentNumber: 'S1009',
    department: 'Psychology',
    cardBalance: 14.30,
    cardStatus: 'active'
  },
  {
    id: '1010',
    name: 'Benjamin Thomas',
    email: 'benjamin.thomas@university.edu',
    studentNumber: 'S1010',
    department: 'History',
    cardBalance: 56.75,
    cardStatus: 'active'
  },
  {
    id: '1011',
    name: 'Mia Jackson',
    email: 'mia.jackson@university.edu',
    studentNumber: 'S1011',
    department: 'English',
    cardBalance: 42.20,
    cardStatus: 'active'
  },
  {
    id: '1012',
    name: 'Lucas White',
    email: 'lucas.white@university.edu',
    studentNumber: 'S1012',
    department: 'Political Science',
    cardBalance: 18.90,
    cardStatus: 'active'
  },
  {
    id: '1013',
    name: 'Charlotte Harris',
    email: 'charlotte.harris@university.edu',
    studentNumber: 'S1013',
    department: 'Sociology',
    cardBalance: 75.60,
    cardStatus: 'active'
  },
  {
    id: '1014',
    name: 'Henry Martin',
    email: 'henry.martin@university.edu',
    studentNumber: 'S1014',
    department: 'Philosophy',
    cardBalance: 29.95,
    cardStatus: 'active'
  },
  {
    id: '1015',
    name: 'Amelia Thompson',
    email: 'amelia.thompson@university.edu',
    studentNumber: 'S1015',
    department: 'Art',
    cardBalance: 63.40,
    cardStatus: 'active'
  }
];

// Failed transactions with reasons
const failedTransactions = [
  {
    id: 'fail-001',
    studentName: 'Michael Chen',
    cardNumber: 'C1002',
    type: 'purchase' as const,
    amount: -15.75,
    status: 'failed' as const,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    description: 'Cafeteria lunch',
    failureReason: 'Insufficient funds'
  },
  {
    id: 'fail-002',
    studentName: 'David Kim',
    cardNumber: 'C1004',
    type: 'purchase' as const,
    amount: -8.50,
    status: 'failed' as const,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    description: 'Bookstore purchase',
    failureReason: 'Card balance below minimum threshold'
  },
  {
    id: 'fail-003',
    studentName: 'John Doe',
    cardNumber: 'C1006',
    type: 'recharge' as const,
    amount: 50.00,
    status: 'failed' as const,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Online recharge',
    failureReason: 'Payment method declined'
  }
];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<(Student & { name: string; email: string; cardBalance: number })[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New state variables for enhanced features
  const [studentSearch, setStudentSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [studentSortField, setStudentSortField] = useState<SortField>('name');
  const [studentSortOrder, setStudentSortOrder] = useState<SortOrder>('asc');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<TransactionType>('all');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<TransactionStatus>('all');
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<(Student & { name: string; email: string; cardBalance: number }) | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [itemsPerPage] = useState(5);
  
  // System settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    transactionFee: 0.5,
    minimumBalance: 5.0,
    maximumBalance: 500.0,
    autoRecharge: false,
    lowBalanceAlert: 10.0,
    cardReplacementFee: 25.0,
    dailySpendingLimit: 100.0,
    systemMaintenanceMode: false,
    currency: 'INR',
    receiptPrinting: true
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Conversion rate (example rate, you might want to fetch this from an API)
  const usdToInrRate = 83.5;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, studentsData, transactionsData] = await Promise.all([
          api.getDashboardStats(),
          api.getStudents(),
          api.getTransactions()
        ]);
        
        // Convert USD to INR for all monetary values
        const convertedStats = {
          ...statsData,
          totalBalance: (statsData.totalBalance || 0) * usdToInrRate,
          todayRevenue: (statsData.todayRevenue || 0) * usdToInrRate
        };
        
        const convertedStudents = studentsData.map(student => ({
          ...student,
          cardBalance: (student.cardBalance || 0) * usdToInrRate
        }));
        
        const convertedAdditionalStudents = additionalStudents.map(student => ({
          ...student,
          cardBalance: (student.cardBalance || 0) * usdToInrRate
        }));
        
        const convertedTransactions = transactionsData.map(transaction => ({
          ...transaction,
          amount: (transaction.amount || 0) * usdToInrRate
        }));
        
        const convertedFailedTransactions = failedTransactions.map(transaction => ({
          ...transaction,
          amount: (transaction.amount || 0) * usdToInrRate
        }));
        
        setStats(convertedStats);
        setStudents([...convertedStudents, ...convertedAdditionalStudents]);
        setRecentTransactions([...convertedTransactions.slice(0, 7), ...convertedFailedTransactions]);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort students
  const filteredAndSortedStudents = React.useMemo(() => {
    let result = students.filter(student => 
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.department.toLowerCase().includes(studentSearch.toLowerCase())
    );

    result.sort((a, b) => {
      if (studentSortOrder === 'asc') {
        return a[studentSortField] > b[studentSortField] ? 1 : -1;
      } else {
        return a[studentSortField] < b[studentSortField] ? 1 : -1;
      }
    });

    return result;
  }, [students, studentSearch, studentSortField, studentSortOrder]);

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    return recentTransactions.filter(transaction => 
      (transactionTypeFilter === 'all' || transaction.type === transactionTypeFilter) &&
      (transactionStatusFilter === 'all' || transaction.status === transactionStatusFilter) &&
      (transaction.studentName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
       transaction.cardNumber.toLowerCase().includes(transactionSearch.toLowerCase()))
    );
  }, [recentTransactions, transactionSearch, transactionTypeFilter, transactionStatusFilter]);

  // Get students who made purchases
  const studentsWithPurchases = React.useMemo(() => {
    const purchaseTransactions = recentTransactions.filter(t => t.type === 'purchase');
    const studentIds = new Set(purchaseTransactions.map(t => t.cardNumber));
    return students.filter(student => studentIds.has(student.studentNumber));
  }, [recentTransactions, students]);

  // Pagination for students
  const paginatedStudents = React.useMemo(() => {
    const startIndex = (currentStudentPage - 1) * itemsPerPage;
    return filteredAndSortedStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedStudents, currentStudentPage, itemsPerPage]);

  // Pagination for transactions
  const paginatedTransactions = React.useMemo(() => {
    const startIndex = (currentTransactionPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentTransactionPage, itemsPerPage]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStudentSort = (field: SortField) => {
    if (studentSortField === field) {
      setStudentSortOrder(studentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStudentSortField(field);
      setStudentSortOrder('asc');
    }
  };

  const handleStudentClick = (student: Student & { name: string; email: string; cardBalance: number }) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleExportData = (type: 'students' | 'transactions') => {
    // In a real app, this would generate a CSV or PDF file
    console.log(`Exporting ${type} data`);
    alert(`Export functionality would download ${type} data in a real application`);
  };

  // Quick Actions Handlers
  const handleViewAllStudents = () => {
    // Scroll to students section
    document.getElementById('students-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTransactionReports = () => {
    // Generate and download a sample report
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalTransactions: filteredTransactions.length,
      totalRevenue: filteredTransactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      transactions: filteredTransactions
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `transaction-report-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    alert('Transaction report generated and downloaded successfully!');
  };

  const handleSystemSettings = () => {
    setShowSystemSettings(true);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', systemSettings);
      alert('System settings saved successfully!');
      setShowSystemSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSystemSettings({
        transactionFee: 0.5 * usdToInrRate,
        minimumBalance: 5.0 * usdToInrRate,
        maximumBalance: 500.0 * usdToInrRate,
        autoRecharge: false,
        lowBalanceAlert: 10.0 * usdToInrRate,
        cardReplacementFee: 25.0 * usdToInrRate,
        dailySpendingLimit: 100.0 * usdToInrRate,
        systemMaintenanceMode: false,
        currency: 'INR',
        receiptPrinting: true
      });
      alert('Settings have been reset to default values.');
    }
  };

  const handlePurchaseFilter = () => {
    setTransactionTypeFilter('purchase');
    setTransactionStatusFilter('all');
    // Also filter students to show only those with purchases
    setStudents(studentsWithPurchases);
    alert('Now showing students with purchase transactions');
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Stats Cards - Keep original */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents + additionalStudents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency((stats?.totalBalance || 0) + (173.45 * usdToInrRate))}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{(stats?.totalTransactions || 0) + 3}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.todayRevenue || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats - Keep original */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
              <BarChart3 className="w-6 h-6 text-gray-600" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Cards</span>
                <span className="font-semibold text-gray-900">{stats?.activeCards + additionalStudents.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Recharges</span>
                <span className="font-semibold text-orange-600">{stats?.pendingRecharges}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Balance</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(((stats?.totalBalance || 0) + (173.45 * usdToInrRate)) / ((stats?.totalStudents || 0) + additionalStudents.length))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div className="space-y-3">
              <button 
                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center"
                onClick={handleViewAllStudents}
              >
                <UserCog className="w-5 h-5 text-blue-700 mr-3" />
                <div>
                  <div className="font-medium text-blue-900">View All Students</div>
                  <div className="text-sm text-blue-700">Manage student accounts and cards</div>
                </div>
              </button>
              <button 
                className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center"
                onClick={handleTransactionReports}
              >
                <FileText className="w-5 h-5 text-green-700 mr-3" />
                <div>
                  <div className="font-medium text-green-900">Transaction Reports</div>
                  <div className="text-sm text-green-700">Generate detailed reports</div>
                </div>
              </button>
              <button 
                className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center"
                onClick={handleSystemSettings}
              >
                <Settings className="w-5 h-5 text-purple-700 mr-3" />
                <div>
                  <div className="font-medium text-purple-900">System Settings</div>
                  <div className="text-sm text-purple-700">Configure system parameters</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Students Table - Enhanced with search, sort, and pagination */}
        <div id="students-section" className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Student Overview</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <button 
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
                onClick={() => handleExportData('students')}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleStudentSort('name')}
                  >
                    <div className="flex items-center">
                      Student
                      {studentSortField === 'name' && (
                        studentSortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleStudentSort('studentNumber')}
                  >
                    <div className="flex items-center">
                      Student Number
                      {studentSortField === 'studentNumber' && (
                        studentSortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleStudentSort('department')}
                  >
                    <div className="flex items-center">
                      Department
                      {studentSortField === 'department' && (
                        studentSortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleStudentSort('cardBalance')}
                  >
                    <div className="flex items-center">
                      Card Balance
                      {studentSortField === 'cardBalance' && (
                        studentSortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.studentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        student.cardBalance > (50 * usdToInrRate) ? 'text-green-600' : 
                        student.cardBalance > (20 * usdToInrRate) ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(student.cardBalance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleStudentClick(student)}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination for students */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentStudentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentStudentPage * itemsPerPage, filteredAndSortedStudents.length)}</span> of{' '}
              <span className="font-medium">{filteredAndSortedStudents.length}</span> students
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                onClick={() => setCurrentStudentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentStudentPage === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                onClick={() => setCurrentStudentPage(prev => 
                  prev < Math.ceil(filteredAndSortedStudents.length / itemsPerPage) ? prev + 1 : prev
                )}
                disabled={currentStudentPage >= Math.ceil(filteredAndSortedStudents.length / itemsPerPage)}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions - Enhanced with search and filters */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <div className="flex space-x-2">
                <button 
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
                  onClick={handlePurchaseFilter}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Show Purchases
                </button>
                <button 
                  className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
                  onClick={() => handleExportData('transactions')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <select
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value as TransactionType)}
                >
                  <option value="all">All Types</option>
                  <option value="recharge">Recharge</option>
                  <option value="purchase">Purchase</option>
                </select>
                <select
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={transactionStatusFilter}
                  onChange={(e) => setTransactionStatusFilter(e.target.value as TransactionStatus)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.studentName}</div>
                      <div className="text-sm text-gray-500">{transaction.cardNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'recharge' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.type === 'recharge' ? 'Recharge' : 'Purchase'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {formatDate(transaction.createdAt)}
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  <button 
    className="text-blue-600 hover:text-blue-900"
    onClick={() => handleTransactionClick(transaction)}
  >
    <Eye className="w-5 h-5" />
  </button>
</td>
</tr>
))}
</tbody>
</table>
</div>
{/* Pagination for transactions */}
<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
  <div className="text-sm text-gray-700">
    Showing <span className="font-medium">{(currentTransactionPage - 1) * itemsPerPage + 1}</span> to{' '}
    <span className="font-medium">{Math.min(currentTransactionPage * itemsPerPage, filteredTransactions.length)}</span> of{' '}
    <span className="font-medium">{filteredTransactions.length}</span> transactions
  </div>
  <div className="flex space-x-2">
    <button
      className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
      onClick={() => setCurrentTransactionPage(prev => Math.max(prev - 1, 1))}
      disabled={currentTransactionPage === 1}
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
    <button
      className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
      onClick={() => setCurrentTransactionPage(prev => 
        prev < Math.ceil(filteredTransactions.length / itemsPerPage) ? prev + 1 : prev
      )}
      disabled={currentTransactionPage >= Math.ceil(filteredTransactions.length / itemsPerPage)}
    >
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>
</div>
</div>

{/* Student Details Modal */}
{showStudentModal && selectedStudent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Student Details</h3>
        <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
            <div className="space-y-2">
              <p><span className="text-gray-600">Name:</span> {selectedStudent.name}</p>
              <p><span className="text-gray-600">Email:</span> {selectedStudent.email}</p>
              <p><span className="text-gray-600">Student Number:</span> {selectedStudent.studentNumber}</p>
              <p><span className="text-gray-600">Department:</span> {selectedStudent.department}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Card Information</h4>
            <div className="space-y-2">
              <p><span className="text-gray-600">Balance:</span> 
                <span className={`font-medium ml-2 ${
                  selectedStudent.cardBalance > (50 * usdToInrRate) ? 'text-green-600' : 
                  selectedStudent.cardBalance > (20 * usdToInrRate) ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {formatCurrency(selectedStudent.cardBalance)}
                </span>
              </p>
              <p><span className="text-gray-600">Status:</span> 
                <span className="ml-2 capitalize">{selectedStudent.cardStatus}</span>
              </p>
              <p><span className="text-gray-600">Last Updated:</span> 
                <span className="ml-2">{new Date().toLocaleDateString()}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Recent Transactions</h4>
          <div className="space-y-3">
            {recentTransactions
              .filter(t => t.cardNumber === selectedStudent.studentNumber)
              .slice(0, 5)
              .map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                  </div>
                  <span className={`font-medium ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
  {/* Buttons removed as requested */}
</div>
    </div>
  </div>
)}

{/* Transaction Details Modal */}
{showTransactionModal && selectedTransaction && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
        <button onClick={() => setShowTransactionModal(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Transaction Information</h4>
            <div className="space-y-2">
              <p><span className="text-gray-600">ID:</span> {selectedTransaction.id}</p>
              <p><span className="text-gray-600">Type:</span> 
                <span className={`ml-2 capitalize ${
                  selectedTransaction.type === 'recharge' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {selectedTransaction.type}
                </span>
              </p>
              <p><span className="text-gray-600">Amount:</span> 
                <span className={`ml-2 font-medium ${
                  selectedTransaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(selectedTransaction.amount))}
                </span>
              </p>
              <p><span className="text-gray-600">Date:</span> 
                <span className="ml-2">{formatDate(selectedTransaction.createdAt)}</span>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Status Information</h4>
            <div className="space-y-2">
              <p><span className="text-gray-600">Status:</span> 
                <span className={`ml-2 capitalize ${
                  selectedTransaction.status === 'completed' ? 'text-green-600' :
                  selectedTransaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {selectedTransaction.status}
                </span>
              </p>
              {selectedTransaction.failureReason && (
                <p><span className="text-gray-600">Failure Reason:</span> 
                  <span className="ml-2 text-red-600">{selectedTransaction.failureReason}</span>
                </p>
              )}
              <p><span className="text-gray-600">Description:</span> 
                <span className="ml-2">{selectedTransaction.description}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">{selectedTransaction.studentName}</p>
            <p className="text-sm text-gray-600">Card: {selectedTransaction.cardNumber}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          onClick={() => {
            // Generate receipt content
            const receiptContent = `
                TRANSACTION RECEIPT
                -------------------------------
                Transaction ID: ${selectedTransaction.id}
                Date: ${formatDate(selectedTransaction.createdAt)}
                Student: ${selectedTransaction.studentName}
                Card: ${selectedTransaction.cardNumber}
                Type: ${selectedTransaction.type}
                Amount: ${formatCurrency(Math.abs(selectedTransaction.amount))}
                Status: ${selectedTransaction.status}
                ${selectedTransaction.failureReason ? 'Failure Reason: ' + selectedTransaction.failureReason : ''}
                Description: ${selectedTransaction.description}
                -------------------------------
                Generated on: ${new Date().toLocaleString()}
               `;
            
            // Create and download text file
            const blob = new Blob([receiptContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${selectedTransaction.id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </button>
        {selectedTransaction.status === 'failed' && (
          <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
            Retry Transaction
          </button>
        )}
      </div>
    </div>
  </div>
)}

{/* System Settings Modal */}
{showSystemSettings && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
        <button onClick={() => setShowSystemSettings(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Fee</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                className="pl-8 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={systemSettings.transactionFee}
                onChange={(e) => setSystemSettings({...systemSettings, transactionFee: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Balance</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                className="pl-8 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={systemSettings.minimumBalance}
                onChange={(e) => setSystemSettings({...systemSettings, minimumBalance: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Balance</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                className="pl-8 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={systemSettings.maximumBalance}
                onChange={(e) => setSystemSettings({...systemSettings, maximumBalance: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Low Balance Alert</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                className="pl-8 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={systemSettings.lowBalanceAlert}
                onChange={(e) => setSystemSettings({...systemSettings, lowBalanceAlert: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Replacement Fee</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                className="pl-8 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={systemSettings.cardReplacementFee}
                onChange={(e) => setSystemSettings({...systemSettings, cardReplacementFee: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Spending Limit</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                className="pl-8 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={systemSettings.dailySpendingLimit}
                onChange={(e) => setSystemSettings({...systemSettings, dailySpendingLimit: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoRecharge"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={systemSettings.autoRecharge}
              onChange={(e) => setSystemSettings({...systemSettings, autoRecharge: e.target.checked})}
            />
            <label htmlFor="autoRecharge" className="ml-2 block text-sm text-gray-900">
              Enable Auto Recharge
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="receiptPrinting"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={systemSettings.receiptPrinting}
              onChange={(e) => setSystemSettings({...systemSettings, receiptPrinting: e.target.checked})}
            />
            <label htmlFor="receiptPrinting" className="ml-2 block text-sm text-gray-900">
              Enable Receipt Printing
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenanceMode"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={systemSettings.systemMaintenanceMode}
              onChange={(e) => setSystemSettings({...systemSettings, systemMaintenanceMode: e.target.checked})}
            />
            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
              System Maintenance Mode
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            className="px-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={systemSettings.currency}
            onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
        <button 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center"
          onClick={handleResetSettings}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </button>
        <div className="flex space-x-3">
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            onClick={() => setShowSystemSettings(false)}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
            onClick={handleSaveSettings}
            disabled={savingSettings}
          >
            {savingSettings ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
</Layout>
);
};

export default AdminDashboard;