import React from 'react';
// FIX: Corrected import path for types.
import { View } from '../types';
import ProtectedComponent from './common/ProtectedComponent';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
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

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-brand-primary text-white shadow-lg'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </a>
  </li>
);

const navIcons = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>,
    students: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    financials: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    leads: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>,
    communications: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>,
    staff: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 16.5V22l-4-2-4 2v-5.5"/><circle cx="12" cy="7.5" r="4.5"/><path d="M12 12a10 10 0 0 0-7.53 16.58"/></svg>,
    agenda: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
    reports: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 18v-3"/><path d="M15 18v-1"/></svg>,
    library: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
    gallery: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
    declarations: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M12 15-4 7"/><path d="m12 15 8-8"/><path d="M12 8v12"/></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21a8 8 0 0 1 10.43-7.62"/><circle cx="10" cy="8" r="4"/><circle cx="18" cy="18" r="3"/><path d="m19.5 14.5-.42.42"/><path d="m16.5 21.5-.42-.42"/><path d="m21.5 16.5-.42.42"/><path d="m14.5 19.5-.42-.42"/><path d="m19.5 21.5.42-.42"/><path d="m16.5 14.5.42.42"/><path d="m14.5 16.5.42-.42"/><path d="m21.5 19.5.42.42"/></svg>,
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="w-64 bg-brand-dark text-white flex flex-col p-4 shadow-2xl">
      <div className="flex items-center mb-10 px-2">
        <SchoolIcon className="h-10 w-10 text-brand-primary" />
        <h1 className="text-2xl font-bold ml-3 text-white">EducaLink</h1>
      </div>
      <nav className="flex-1">
        <ul className="space-y-3">
            <ProtectedComponent requiredPermission='view_dashboard'>
                <NavItem icon={navIcons.dashboard} label="Dashboard" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
            </ProtectedComponent>
            <ProtectedComponent requiredPermission='view_students'>
                <NavItem icon={navIcons.students} label="Alunos" isActive={activeView === 'students'} onClick={() => setActiveView('students')} />
            </ProtectedComponent>
            <ProtectedComponent requiredPermission='view_staff'>
                <NavItem icon={navIcons.staff} label="Funcionários" isActive={activeView === 'staff'} onClick={() => setActiveView('staff')} />
            </ProtectedComponent>
             <ProtectedComponent requiredPermission='view_financials'>
                <NavItem icon={navIcons.financials} label="Financeiro" isActive={activeView === 'financials'} onClick={() => setActiveView('financials')} />
            </ProtectedComponent>
            <ProtectedComponent requiredPermission='view_leads'>
                <NavItem icon={navIcons.leads} label="Admissões" isActive={activeView === 'leads'} onClick={() => setActiveView('leads')} />
            </ProtectedComponent>
            <ProtectedComponent requiredPermission='view_agenda'>
                <NavItem icon={navIcons.agenda} label="Agenda Online" isActive={activeView === 'agenda'} onClick={() => setActiveView('agenda')} />
            </ProtectedComponent>
            <ProtectedComponent requiredPermission='view_communications'>
                <NavItem icon={navIcons.communications} label="Comunicação" isActive={activeView === 'communications'} onClick={() => setActiveView('communications')} />
            </ProtectedComponent>
             <ProtectedComponent requiredPermission='view_declarations'>
                <NavItem icon={navIcons.declarations} label="Declarações" isActive={activeView === 'declarations'} onClick={() => setActiveView('declarations')} />
            </ProtectedComponent>
            <ProtectedComponent requiredPermission='view_gallery'>
                <NavItem icon={navIcons.gallery} label="Mural de Fotos" isActive={activeView === 'gallery'} onClick={() => setActiveView('gallery')} />
            </ProtectedComponent>
            <ProtectedComponent requiredPermission='view_library'>
                <NavItem icon={navIcons.library} label="Biblioteca" isActive={activeView === 'library'} onClick={() => setActiveView('library')} />
            </ProtectedComponent>
            <ProtectedComponent requiredPermission='view_reports'>
                <NavItem icon={navIcons.reports} label="Relatórios" isActive={activeView === 'reports'} onClick={() => setActiveView('reports')} />
            </ProtectedComponent>
        </ul>
      </nav>
      <div className="mt-auto">
         <ul className="space-y-3 pt-4 border-t border-slate-700">
             <ProtectedComponent requiredPermission='view_users'>
                <NavItem icon={navIcons.users} label="Usuários" isActive={activeView === 'users'} onClick={() => setActiveView('users')} />
            </ProtectedComponent>
            <ProtectedComponent requiredPermission='view_settings'>
                <NavItem icon={navIcons.settings} label="Configurações" isActive={activeView === 'settings'} onClick={() => setActiveView('settings')} />
             </ProtectedComponent>
         </ul>
        <div className="pt-6 text-center text-slate-400 text-sm">
            <p>&copy; 2024 EducaLink CRM</p>
            <p>Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;