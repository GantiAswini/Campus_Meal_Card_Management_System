import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Users, CreditCard } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-600';
      case 'manager': return 'bg-green-600';
      case 'cashier': return 'bg-purple-600';
      case 'student': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-5 h-5" />;
      case 'manager': return <Users className="w-5 h-5" />;
      case 'cashier': return <CreditCard className="w-5 h-5" />;
      case 'student': return <User className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`${getRoleColor(user?.role || '')} text-white shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon(user?.role || '')}
                <h1 className="text-2xl font-bold">{title}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm opacity-90 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;