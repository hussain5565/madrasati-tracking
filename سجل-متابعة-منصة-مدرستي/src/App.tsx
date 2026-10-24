import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { SchoolView } from './components/school/SchoolView';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-['Cairo']">
      <Header />

      <div className="flex-1">
        {currentUser.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <SchoolView />
        )}
      </div>

      {/* Footer */}
      <footer className="no-print mt-auto py-4 border-t border-slate-200/80 bg-white/60 text-center text-xs text-slate-500">
        <p className="font-medium">
          منظومة سجل متابعة منصة مدرستي • التقويم الدراسي 1448هـ
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          وزارة التعليم بالمملكة العربية السعودية
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
