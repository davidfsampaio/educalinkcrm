import React, { useState, lazy, Suspense, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { View, Permission, Student, Staff as StaffType } from './types';
import { DataProvider } from './contexts/DataContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AccessDenied from './components/common/AccessDenied';
import { PWAProvider } from './contexts/PWAContext';
import { supabase } from './services/supabaseClient';

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


const MainApp: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [initialSelectedItem, setInitialSelectedItem] = useState<Student | StaffType | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { hasPermission } = useAuth();
  const [initialAction, setInitialAction] = useState<string | null>(null);

  // Handle PWA shortcut actions
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');

    if (action) {
        if (action === 'new_student') {
            setActiveView('students');
            setInitialAction('new_student');
        } else if (action === 'new_lead') {
            setActiveView('leads');
            setInitialAction('new_lead');
        }
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSearchSelect = (item: Student | StaffType) => {
    // Check if the item is a Student or Staff using a unique property
    if ('parent_name' in item) { // This is a simple way to differentiate Student
      setActiveView('students');
    } else {
      setActiveView('staff');
    }
    setInitialSelectedItem(item);
  };

  useEffect(() => {
    if (initialSelectedItem) {
      // Clear the item after a short delay so the child component can process it
      const timer = setTimeout(() => setInitialSelectedItem(null), 100);
      return () => clearTimeout(timer);
    }
  }, [initialSelectedItem]);


  const renderView = () => {
    const requiredPermission = viewPermissions[activeView];
    if (!hasPermission(requiredPermission)) {
        return <AccessDenied />;
    }

    const isStudent = initialSelectedItem && 'parent_name' in initialSelectedItem;
    const isStaff = initialSelectedItem && !('parent_name' in initialSelectedItem);

    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students initialStudent={isStudent ? initialSelectedItem as Student : null} initialAction={initialAction} />;
      case 'staff': return <Staff initialStaff={isStaff ? initialSelectedItem as StaffType : null} />;
      case 'financials': return <Financials />;
      case 'leads': return <Leads initialAction={initialAction} />;
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
        <Header currentView={activeView} onMenuClick={() => setSidebarOpen(true)} onSearchSelect={handleSearchSelect} onLogout={onLogout} />
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

const StaffLoginScreen: React.FC<{ onBack: () => void; authError: string | null; setAuthError: (error: string | null) => void; }> = ({ onBack, authError, setAuthError }) => {
    const { signInAsStaff } = useAuth();
    const [email, setEmail] = useState('admin@educalink.com');
    const [password, setPassword] = useState('admin123');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setAuthError(null);
        await signInAsStaff(email, password);
        // The AuthContext now handles the global loading state and sets the error
        setIsLoading(false);
    };
    
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (authError) setAuthError(null);
        setter(e.target.value);
    }

    return (
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-xl">
            <div className="flex flex-col items-center text-center">
                <SchoolIcon className="h-12 w-12 text-brand-primary" />
                <h2 className="text-2xl font-bold mt-3 text-brand-text-dark">Login da Equipe</h2>
            </div>
            {authError && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{authError}</p>}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleInputChange(setEmail)}
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
                        onChange={handleInputChange(setPassword)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        placeholder="admin123"
                    />
                </div>
                 <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 font-semibold rounded-lg text-white bg-brand-primary hover:bg-sky-600 transition-all duration-300 disabled:bg-slate-400"
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
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

const ParentLoginScreen: React.FC<{ onBack: () => void; authError: string | null; setAuthError: (error: string | null) => void; }> = ({ onBack, authError, setAuthError }) => {
    const { signInAsParent } = useAuth();
    const [email, setEmail] = useState('ana.silva@email.com');
    const [password, setPassword] = useState('senha123'); // Example password
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setAuthError(null);
        await signInAsParent(email, password);
        setIsLoading(false);
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (authError) setAuthError(null);
        setter(e.target.value);
    }

    return (
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-xl">
            <div className="flex flex-col items-center text-center">
                <SchoolIcon className="h-12 w-12 text-brand-primary" />
                <h2 className="text-2xl font-bold mt-3 text-brand-text-dark">Portal do Responsável</h2>
            </div>
            {authError && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{authError}</p>}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleInputChange(setEmail)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        placeholder="responsavel@email.com"
                    />
                </div>
                 <div>
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700">Senha</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={handleInputChange(setPassword)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        placeholder="********"
                    />
                </div>
                 <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 font-semibold rounded-lg text-white bg-brand-primary hover:bg-sky-600 transition-all duration-300 disabled:bg-slate-400"
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
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

const AuthScreen: React.FC = () => {
    const [view, setView] = useState<'initial' | 'staff_login' | 'parent_login'>('initial');
    const { authError, setAuthError } = useAuth();

    const handleSelect = (type: 'staff' | 'parent') => {
        if (authError) setAuthError(null);
        if (type === 'staff') {
            setView('staff_login');
        } else {
            setView('parent_login');
        }
    };
    
    const handleBackToInitial = () => {
        if (authError) setAuthError(null);
        setView('initial');
    }

    return (
        <div className="flex items-center justify-center h-screen bg-slate-100 p-4">
            {view === 'initial' && <InitialSelectionScreen onSelect={handleSelect} />}
            {view === 'staff_login' && <StaffLoginScreen onBack={handleBackToInitial} authError={authError} setAuthError={setAuthError} />}
            {view === 'parent_login' && <ParentLoginScreen onBack={handleBackToInitial} authError={authError} setAuthError={setAuthError} />}
        </div>
    );
};


const AppRouter: React.FC = () => {
    const { currentUser, isLoading } = useAuth();
    const [page, setPage] = useState<'crm' | 'capture' | null>(null);

    useEffect(() => {
        const handleRouting = () => {
            if (window.location.hash.startsWith('#/capture/')) {
                setPage('capture');
            } else {
                setPage('crm');
            }
        };

        handleRouting();
        window.addEventListener('hashchange', handleRouting);
        return () => window.removeEventListener('hashchange', handleRouting);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (isLoading || page === null) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <p>Verificando sessão...</p>
            </div>
        );
    }

    if (page === 'capture') {
        return (
            <DataProvider>
                <PublicLeadCapturePage />
            </DataProvider>
        );
    }
    
    if (!currentUser) {
        return <AuthScreen />;
    }

    if (currentUser) {
        if (currentUser.role === 'Pai/Responsável') {
            return (
                <DataProvider>
                    <ParentPortal onLogout={handleLogout} />
                </DataProvider>
            );
        }

        return (
            <DataProvider>
                <MainApp onLogout={handleLogout} />
            </DataProvider>
        );
    }
    
    return <AuthScreen />;
};

const PermissionCalculator: React.FC = () => {
    const { currentUser, setUserPermissions } = useAuth();
    const { settings } = useSettings();

    useEffect(() => {
        if (!currentUser || !settings.roles) {
            setUserPermissions(new Set());
            return;
        }
        const role = settings.roles.find(r => r.name === currentUser.role);
        const permissions = new Set<Permission>(role ? role.permissions : []);
        setUserPermissions(permissions);
    }, [currentUser, settings.roles, setUserPermissions]);

    return null; // This component doesn't render anything
}


const App: React.FC = () => {
  return (
    <PWAProvider>
      <AuthProvider>
        <SettingsProvider>
            <PermissionCalculator />
            <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><p>Carregando Módulo...</p></div>}>
              <AppRouter />
            </Suspense>
        </SettingsProvider>
      </AuthProvider>
    </PWAProvider>
  );
};

export default App;