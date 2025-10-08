import React, { useState } from 'react';
import { View, Student, Staff } from '../types';
import NotificationPanel from './common/NotificationPanel';
import GlobalSearch from './common/GlobalSearch';
import { usePWA } from '../contexts/PWAContext';

interface HeaderProps {
    currentView: View;
    onMenuClick: () => void;
    onSearchSelect: (item: Student | Staff) => void;
}

const viewTitles: Record<View, string> = {
    dashboard: 'Dashboard',
    students: 'Gestão de Alunos',
    staff: 'Gestão de Funcionários',
    financials: 'Controle Financeiro',
    leads: 'Funil de Admissões',
    communications: 'Central de Comunicação',
    agenda: 'Agenda Online',
    settings: 'Configurações do Sistema',
    reports: 'Relatórios e Análises',
    library: 'Gestão da Biblioteca',
    gallery: 'Mural de Fotos',
    declarations: 'Central de Declarações',
    users: 'Gestão de Usuários',
};

const InstallPWABtn: React.FC<{ onInstall: () => void }> = ({ onInstall }) => (
    <button
        onClick={onInstall}
        className="hidden sm:flex items-center space-x-2 bg-brand-primary/10 text-brand-primary font-bold py-2 px-3 rounded-lg hover:bg-brand-primary/20 transition-colors duration-300"
        title="Instalar o aplicativo no seu dispositivo"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        <span className="hidden lg:inline">Instalar App</span>
    </button>
);

const OfflineIndicator: React.FC = () => (
    <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 font-bold py-2 px-3 rounded-lg" title="Você está offline. Algumas funcionalidades podem estar limitadas.">
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19.47 13.99a9 9 0 0 0-11.48-11.48"/><path d="M4.53 10.01a9 9 0 0 0 11.48 11.48"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
        <span className="hidden lg:inline">Offline</span>
    </div>
);


const Header: React.FC<HeaderProps> = ({ currentView, onMenuClick, onSearchSelect }) => {
    const title = viewTitles[currentView];
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(true); // Assume there are unread notifications initially
    const { canInstall, triggerInstall, isOnline } = usePWA();

    const handleNotificationClick = () => {
        setNotificationsOpen(prev => !prev);
    };

    return (
        <header className={`bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 ${isNotificationsOpen ? 'z-50' : 'z-20'}`}>
            <div className="flex items-center">
                 <button
                    onClick={onMenuClick}
                    className="md:hidden mr-4 text-brand-text-light hover:text-brand-primary"
                    aria-label="Abrir menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-brand-text-dark truncate">{title}</h1>
            </div>
            
            <div className="flex-1 flex justify-center px-4">
                <GlobalSearch onSelect={onSearchSelect} />
            </div>

            <div className="flex items-center space-x-4">
                {!isOnline && <OfflineIndicator />}
                {canInstall && <InstallPWABtn onInstall={triggerInstall} />}
                <div className="relative">
                    <button 
                        onClick={handleNotificationClick}
                        className="relative text-brand-text-light hover:text-brand-primary"
                        aria-label="Abrir notificações"
                        aria-haspopup="true"
                        aria-expanded={isNotificationsOpen}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                        {hasUnread && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </button>
                    <NotificationPanel 
                        isOpen={isNotificationsOpen} 
                        onClose={() => setNotificationsOpen(false)} 
                        setHasUnread={setHasUnread}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <img className="h-10 w-10 rounded-full" src="https://picsum.photos/seed/user/100/100" alt="User Avatar" />
                    <div className="hidden sm:block">
                        <p className="font-semibold text-brand-text-dark">Diretor(a)</p>
                        <p className="text-sm text-brand-text-light">Admin</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;