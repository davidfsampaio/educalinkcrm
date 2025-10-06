import React, { useState, lazy, Suspense, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { View, Permission } from './types';
import { DataProvider } from './contexts/DataContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AccessDenied from './components/common/AccessDenied';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const Students = lazy(() => import('./components/Students'));
const Financials = lazy(() => import('./components/Financials'));
const Leads = lazy(() => import('./components/Leads'));
const Communications = lazy(() => import('./components/Communications'));
const Staff = lazy(() => import('./components/Staff'));
const Agenda = lazy(() => import('./components/Agenda'));
const Settings = lazy(() => import('./components/Settings'));
const Reports = lazy(() => import('./components/Reports'));
const Library = lazy(() => import('./components/Library'));
const Gallery = lazy(() => import('./components/Gallery'));
const Declarations = lazy(() => import('./components/Declarations'));
const Users = lazy(() => import('./components/Users'));
const ParentPortal = lazy(() => import('./components/parent_portal/ParentPortal'));
const PublicLeadCapturePage = lazy(() => import('./components/PublicLeadCapturePage'));


const viewPermissions: Record<View, Permission> = {
  dashboard: 'view_dashboard',
  students: 'view_students',
  staff: 'view_staff',
  financials: 'view_financials',
  leads: 'view_leads',
  agenda: 'view_agenda',
  communications: 'view_communications',
  declarations: 'view_declarations',
  gallery: 'view_gallery',
  library: 'view_library',
  reports: 'view_reports',
  users: 'view_users',
  settings: 'view_settings',
};

const LoadingFallback: React.FC = () => (
    <div className="flex justify-center items-center h-full w-full">
        <p className="text-brand-text">Carregando...</p>
    </div>
);


const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { hasPermission } = useAuth();

  const renderView = () => {
    const requiredPermission = viewPermissions[activeView];
    if (!hasPermission(requiredPermission)) {
        return <AccessDenied />;
    }

    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'staff': return <Staff />;
      case 'financials': return <Financials />;
      case 'leads': return <Leads />;
      case 'agenda': return <Agenda />;
      case 'communications': return <Communications />;
      case 'settings': return <Settings />;
      case 'reports': return <Reports />;
      case 'library': return <Library />;
      case 'gallery': return <Gallery />;
      case 'declarations': return <Declarations />;
      case 'users': return <Users />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="relative min-h-screen md:flex bg-slate-50 font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0"> {/* Added min-w-0 to prevent content overflow */}
        <Header currentView={activeView} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 md:p-6">
          <Suspense fallback={<LoadingFallback />}>
            {renderView()}
          </Suspense>
        </main>
      </div>
    </div>
  )
}

const SchoolIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 22v-4a2 2 0 1 0-4 0v4" />
        <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" />
        <path d="M18 5v17" />
        <path d="m12 14 6-3" />
        <path d="m6 11 6 3" />
        <path d="M6 5v17" />
        <path d="M12 5v17" />
        <path d="M2 10h20" />
        <path d="m19 4-7 3-7-3" />
        <path d="M12 2v3" />
    </svg>
);


const InitialSelectionScreen: React.FC<{ onSelect: (type: 'staff' | 'parent') => void }> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-md p-6 sm:p-8 space-y-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="flex flex-col items-center">
            <SchoolIcon className="h-16 w-16 text-brand-primary" />
            <h1 className="text-3xl font-bold mt-4 text-brand-text-dark">Bem-vindo ao EducaLink CRM</h1>
            <p className="mt-2 text-brand-text">Selecione seu perfil de acesso</p>
        </div>
        <div className="space-y-4 pt-4">
            <button
                onClick={() => onSelect('staff')}
                className="w-full py-3 px-4 font-semibold rounded-lg text-white bg-brand-primary hover:bg-sky-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
                Acessar como Equipe da Escola
            </button>
            <button
                onClick={() => onSelect('parent')}
                className="w-full py-3 px-4 font-semibold rounded-lg text-brand-text-dark bg-slate-200 hover:bg-slate-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
                Acessar como Pai/Responsável
            </button>
        </div>
         <div className="pt-6 text-center text-slate-400 text-sm">
            <p>&copy; 2024 EducaLink CRM</p>
        </div>
    </div>
  );
};

const StaffLoginScreen: React.FC<{ onLogin: () => void, onBack: () => void }> = ({ onLogin, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        // Hardcoded credentials for demonstration
        if (email === 'admin@educalink.com' && password === 'admin123') {
            setError('');
            onLogin();
        } else {
            setError('Credenciais inválidas. Tente novamente.');
        }
    };

    return (
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-xl">
            <div className="flex flex-col items-center text-center">
                <SchoolIcon className="h-12 w-12 text-brand-primary" />
                <h2 className="text-2xl font-bold mt-3 text-brand-text-dark">Login da Equipe</h2>
            </div>
            {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        placeholder="admin@educalink.com"
                    />
                </div>
                 <div>
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700">Senha</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        placeholder="admin123"
                    />
                </div>
                 <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full py-3 px-4 font-semibold rounded-lg text-white bg-brand-primary hover:bg-sky-600 transition-all duration-300"
                    >
                        Entrar
                    </button>
                </div>
            </form>
            <div className="text-center">
                <button onClick={onBack} className="text-sm font-medium text-brand-primary hover:underline">
                    &larr; Voltar para a seleção de perfil
                </button>
            </div>
        </div>
    );
};

const AuthScreen: React.FC<{ setUserType: (type: 'staff' | 'parent') => void }> = ({ setUserType }) => {
    const [view, setView] = useState<'initial' | 'staff_login'>('initial');

    const handleSelect = (type: 'staff' | 'parent') => {
        if (type === 'staff') {
            setView('staff_login');
        } else {
            setUserType('parent');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-slate-100 p-4">
            {view === 'initial' && <InitialSelectionScreen onSelect={handleSelect} />}
            {view === 'staff_login' && <StaffLoginScreen onLogin={() => setUserType('staff')} onBack={() => setView('initial')} />}
        </div>
    );
};


const App: React.FC = () => {
  const [userType, setUserType] = useState<'staff' | 'parent' | null>(null);
  const [page, setPage] = useState<'crm' | 'capture'>(() => {
    return window.location.pathname.startsWith('/capture/') ? 'capture' : 'crm';
  });


  const handleLogout = () => {
    setUserType(null);
  };

  const renderContent = () => {
    if (page === 'capture') {
        return <PublicLeadCapturePage />;
    }

    if (!userType) {
      return <AuthScreen setUserType={setUserType} />;
    }
    if (userType === 'staff') {
      return (
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      );
    }
    if (userType === 'parent') {
      return <ParentPortal onLogout={handleLogout} />;
    }
    return null;
  };

  return (
    <SettingsProvider>
      <DataProvider>
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><p>Carregando Módulo...</p></div>}>
          {renderContent()}
        </Suspense>
      </DataProvider>
    </SettingsProvider>
  );
};

export default App;