import React, { useState, useEffect } from 'react';
import UserApp from './UserApp';
import AdminPanel from './components/admin/AdminPanel';
import { useAppData } from './hooks/useAppData';

const App: React.FC = () => {
  const [isAdminRoute, setIsAdminRoute] = useState(window.location.hash === '#admin');
  const { isLoading } = useAppData();

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminRoute(window.location.hash === '#admin');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500"></div>
        </div>
    );
  }

  return (
    <main className="max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto p-4 pb-28 min-h-screen">
        {isAdminRoute ? <AdminPanel /> : <UserApp />}
    </main>
  );
};

export default App;
