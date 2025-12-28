
import React, { useState, lazy, Suspense, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { View, Permission, Student, Staff as StaffType, StudentDetailTab, Lead, Invoice } from './types';
import { DataProvider } from './contexts/DataContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AccessDenied from './components/common/AccessDenied';
import { PWAProvider } from './contexts/PWAContext';
import { supabase } from './services/supabaseClient';

// Lazy load components
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
const AITools = lazy(() => import('./components/AITools'));
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
  ai_tools: 'use_ai_tools',
};

const LoadingFallback: React.FC = () => (
    <div className="flex justify-center items-center h-full w-full py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        <p className="ml-3 text-brand-text">Carregando...</p>
    </div>
);


const MainApp: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [initialItem, setInitialItem] = useState<any | null>(null);
  const [initialSubView, setInitialSubView] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { hasPermission } = useAuth();
  const [initialAction, setInitialAction] = useState<string | null>(null);

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
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSearchSelect = (item: Student | StaffType) => {
    if ('parent_name' in item) {
      setActiveView('students');
    } else {
      setActiveView('staff');
    }
    setInitialItem(item);
  };

  const handleNotificationSelect = (item: any, view: View, subView?: string) => {
      setActiveView(view);
      setInitialItem(item);
      if (subView) setInitialSubView(subView);
  };

  useEffect(() => {
    if (initialItem || initialSubView) {
      const timer = setTimeout(() => {
        setInitialItem(null);
        setInitialSubView(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialItem, initialSubView]);


  const renderView = () => {
    const requiredPermission = viewPermissions[activeView];
    if (!hasPermission(requiredPermission)) return <AccessDenied />;

    const isStudent = initialItem && 'parent_name' in initialItem && !('interest_date' in initialItem);
    const isStaff = initialItem && 'hire_date' in initialItem;
    const isLead = initialItem && 'interest_date' in initialItem;
    const isInvoice = initialItem && 'due_date' in initialItem;


    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students initialStudent={isStudent ? initialItem as Student : null} initialAction={initialAction} initialSubView={initialSubView} />;
      case 'staff': return <Staff initialStaff={isStaff ? initialItem as StaffType : null} />;
      case 'financials': return <Financials initialInvoice={isInvoice ? initialItem as Invoice : null} />;
      case 'leads': return <Leads initialAction={initialAction} initialLead={isLead ? initialItem as Lead : null} />;
      case 'agenda': return <Agenda />;
      case 'communications': return <Communications />;
      case 'settings': return <Settings />;
      case 'reports': return <Reports />;
      case 'library': return <Library />;
      case 'gallery': return <Gallery />;
      case 'declarations': return <Declarations />;
      case 'users': return <Users />;
      case 'ai_tools': return <AITools />;
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
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentView={activeView} onMenuClick={() => setSidebarOpen(true)} onSearchSelect={handleSearchSelect} onNotificationSelect={handleNotificationSelect} onLogout={onLogout} />
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


const InitialSelectionScreen: React.FC<{ onSelect: (type: 'staff' | 'parent') => void }> = ({ onSelect }) => (
    <div className="w-full max-w-md p-6 sm:p-8 space-y-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="flex flex-col items-center">
            <SchoolIcon className="h-16 w-16 text-brand-primary" />
            <h1 className="text-3xl font-bold mt-4 text-brand-text-dark">EducaLink CRM</h1>
            <p className="mt-2 text-brand-text">Selecione seu perfil de acesso</p>
        </div>
        <div className="space-y-4 pt-4">
            <button onClick={() => onSelect('staff')} className="w-full py-3 px-4 font-semibold rounded-lg text-white bg-brand-primary hover:bg-sky-600 transition-all duration-300 shadow-md transform hover:-translate-y-1">
                Equipe da Escola
            </button>
            <button onClick={() => onSelect('parent')} className="w-full py-3 px-4 font-semibold rounded-lg text-brand-text-dark bg-slate-200 hover:bg-slate-300 transition-all duration-300 shadow-md transform hover:-translate-y-1">
                Pai / Responsável
            </button>
        </div>
    </div>
);

const AuthScreen: React.FC = () => {
    const [view, setView] = useState<'initial' | 'staff_login' | 'parent_login'>('initial');
    const { authError, setAuthError } = useAuth();

    return (
        <div className="flex items-center justify-center h-screen bg-slate-100 p-4">
            {view === 'initial' && <InitialSelectionScreen onSelect={(t) => t === 'staff' ? setView('staff_login') : setView('parent_login')} />}
            {view === 'staff_login' && <StaffLoginScreen onBack={() => setView('initial')} authError={authError} setAuthError={setAuthError} />}
            {view === 'parent_login' && <ParentLoginScreen onBack={() => setView('initial')} authError={authError} setAuthError={setAuthError} />}
        </div>
    );
};


const StaffLoginScreen = lazy(() => Promise.resolve({ default: ({ onBack, authError, setAuthError }: any) => {
    const { signInAsStaff } = useAuth();
    const [email, setEmail] = useState('admin@educalink.com');
    const [pass, setPass] = useState('admin123');
    const [load, setLoad] = useState(false);
    return (
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-center">Login da Equipe</h2>
            {authError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded">{authError}</div>}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="E-mail" />
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full p-2 border rounded" placeholder="Senha" />
            <button disabled={load} onClick={async () => { setLoad(true); try { await signInAsStaff(email, pass); } catch(e){} setLoad(false); }} className="w-full py-3 bg-brand-primary text-white rounded-lg">{load ? 'Entrando...' : 'Entrar'}</button>
            <button onClick={onBack} className="w-full text-sm text-brand-primary">Voltar</button>
        </div>
    );
}}));

const ParentLoginScreen = lazy(() => Promise.resolve({ default: ({ onBack, authError, setAuthError }: any) => {
    const { signInAsParent } = useAuth();
    const [email, setEmail] = useState('ana.silva@email.com');
    const [pass, setPass] = useState('senha123');
    const [load, setLoad] = useState(false);
    return (
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-center">Portal do Responsável</h2>
            {authError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded">{authError}</div>}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="E-mail" />
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full p-2 border rounded" placeholder="Senha" />
            <button disabled={load} onClick={async () => { setLoad(true); try { await signInAsParent(email, pass); } catch(e){} setLoad(false); }} className="w-full py-3 bg-brand-primary text-white rounded-lg">{load ? 'Entrando...' : 'Entrar'}</button>
            <button onClick={onBack} className="w-full text-sm text-brand-primary">Voltar</button>
        </div>
    );
}}));

const AppRouter: React.FC = () => {
    const { currentUser, isLoading } = useAuth();
    const [page, setPage] = useState<'crm' | 'capture' | null>(null);
    const [failsafeActive, setFailsafeActive] = useState(false);

    useEffect(() => {
        const handleRouting = () => {
            if (window.location.hash.startsWith('#/capture/')) setPage('capture');
            else setPage('crm');
        };
        handleRouting();
        window.addEventListener('hashchange', handleRouting);
        
        // Failsafe de UI: Se após 4 segundos ainda estiver "verificando", permite tentar o login
        const timer = setTimeout(() => setFailsafeActive(true), 4000);
        
        return () => {
            window.removeEventListener('hashchange', handleRouting);
            clearTimeout(timer);
        }
    }, []);

    if ((isLoading && !failsafeActive) || page === null) {
        return (
            <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-primary mb-4"></div>
                <p className="text-slate-600 font-medium animate-pulse">Verificando sessão segura...</p>
            </div>
        );
    }

    if (page === 'capture') return <DataProvider><PublicLeadCapturePage /></DataProvider>;
    if (!currentUser) return <AuthScreen />;

    return (
        <DataProvider>
            {currentUser.role === 'Pai/Responsável' ? (
                <ParentPortal onLogout={() => supabase.auth.signOut()} />
            ) : (
                <MainApp onLogout={() => supabase.auth.signOut()} />
            )}
        </DataProvider>
    );
};

const PermissionCalculator: React.FC = () => {
    const { currentUser, setUserPermissions } = useAuth();
    const { settings } = useSettings();
    useEffect(() => {
        if (!currentUser || !settings.roles) return;
        const role = settings.roles.find(r => r.name === currentUser.role);
        setUserPermissions(new Set<Permission>(role ? role.permissions : []));
    }, [currentUser, settings.roles, setUserPermissions]);
    return null;
}


const App: React.FC = () => {
  return (
    <PWAProvider>
      <AuthProvider>
        <SettingsProvider>
            <PermissionCalculator />
            <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><p>Carregando...</p></div>}>
              <AppRouter />
            </Suspense>
        </SettingsProvider>
      </AuthProvider>
    </PWAProvider>
  );
};

export default App;
