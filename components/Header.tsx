
import React, { useState } from 'react';
import { View, Student, Staff } from '../types';
import GlobalSearch from './common/GlobalSearch';
import NotificationPanel from './common/NotificationPanel';
import { supabase } from '../services/supabaseClient';

interface HeaderProps {
    currentView: View;
    onMenuClick: () => void;
    onSearchSelect: (item: Student | Staff) => void;
    onNotificationSelect: (item: any, view: View, subView?: string) => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    currentView, 
    onMenuClick, 
    onSearchSelect, 
    onNotificationSelect, 
    onLogout 
}) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const titles: Record<View, string> = {
        dashboard: 'Dashboard',
        students: 'Gestão de Alunos',
        staff: 'Corpo Docente e Equipe',
        financials: 'Financeiro',
        leads: 'Admissões (Leads)',
        agenda: 'Agenda Escolar',
        communications: 'Comunicados',
        settings: 'Configurações',
        reports: 'Relatórios e BI',
        library: 'Biblioteca',
        gallery: 'Mural de Fotos',
        declarations: 'Documentos e Declarações',
        users: 'Gestão de Usuários',
        ai_tools: 'Ferramentas de IA'
    };

    const title = titles[currentView] || 'EducaLink';

    const handleActualLogout = async () => {
        await supabase.auth.signOut();
        onLogout();
    };

    return (
        <header className={`bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 ${isNotificationsOpen ? 'z-50' : 'z-20'}`}>
            <div className="flex items-center">
                 <button onClick={onMenuClick} className="md:hidden mr-4 text-brand-text-light hover:text-brand-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-brand-text-dark truncate">{title}</h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
                <div className="hidden sm:block">
                    <GlobalSearch onSelect={onSearchSelect} />
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="p-2 text-brand-text-light hover:text-brand-primary rounded-full hover:bg-slate-100 relative transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                        {hasUnread && <span className="absolute top-2 right-2 h-3 w-3 bg-red-500 border-2 border-white rounded-full"></span>}
                    </button>
                    <NotificationPanel 
                        isOpen={isNotificationsOpen} 
                        onClose={() => setIsNotificationsOpen(false)} 
                        setHasUnread={setHasUnread}
                        onNotificationSelect={onNotificationSelect}
                    />
                </div>

                <button 
                    onClick={handleActualLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                    <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sair
                </button>
            </div>
        </header>
    );
};

export default Header;
