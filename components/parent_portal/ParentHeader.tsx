import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { ParentView } from './ParentPortal';
import ProtectedComponent from '../common/ProtectedComponent';

interface ParentHeaderProps {
    studentName: string;
    onLogout: () => void;
    activeView: ParentView;
    setActiveView: (view: ParentView) => void;
}

const NavItem: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive 
                ? 'bg-brand-primary text-white' 
                : 'text-brand-text-dark hover:bg-slate-200'
        }`}
    >
        {label}
    </button>
);

const ParentHeader: React.FC<ParentHeaderProps> = ({ studentName, onLogout, activeView, setActiveView }) => {
    const { settings } = useSettings();
    const { schoolInfo } = settings;

    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-4">
                        {schoolInfo.logoUrl && <img src={schoolInfo.logoUrl} alt="Logo" className="h-12 w-auto" />}
                        <div>
                            <h1 className="text-xl font-bold text-brand-text-dark">{schoolInfo.name}</h1>
                            <p className="text-sm text-brand-text">Portal do Responsável</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                         <p className="text-brand-text-dark font-semibold">Aluno(a): {studentName}</p>
                         <button
                            onClick={onLogout}
                            className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-brand-text-dark bg-slate-100 hover:bg-slate-200"
                        >
                            Sair
                        </button>
                    </div>
                </div>
                <nav className="flex items-center justify-between border-t border-slate-200 py-2 overflow-x-auto">
                     <div className="flex space-x-2">
                        <ProtectedComponent requiredPermission='view_dashboard'>
                            <NavItem label="Início" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                        </ProtectedComponent>
                        <ProtectedComponent requiredPermission='view_students'>
                            <NavItem label="Vida Acadêmica" isActive={activeView === 'academics'} onClick={() => setActiveView('academics')} />
                        </ProtectedComponent>
                        <ProtectedComponent requiredPermission='view_financials'>
                            <NavItem label="Financeiro" isActive={activeView === 'financials'} onClick={() => setActiveView('financials')} />
                        </ProtectedComponent>
                        <ProtectedComponent requiredPermission='view_communications'>
                            <NavItem label="Comunicados" isActive={activeView === 'communications'} onClick={() => setActiveView('communications')} />
                        </ProtectedComponent>
                        <ProtectedComponent requiredPermission='view_agenda'>
                            <NavItem label="Agenda" isActive={activeView === 'agenda'} onClick={() => setActiveView('agenda')} />
                        </ProtectedComponent>
                        <ProtectedComponent requiredPermission='view_gallery'>
                            <NavItem label="Mural de Fotos" isActive={activeView === 'gallery'} onClick={() => setActiveView('gallery')} />
                        </ProtectedComponent>
                        <ProtectedComponent requiredPermission='view_library'>
                            <NavItem label="Biblioteca" isActive={activeView === 'library'} onClick={() => setActiveView('library')} />
                        </ProtectedComponent>
                    </div>
                    <div className="md:hidden">
                         <button
                            onClick={onLogout}
                            className="px-3 py-2 rounded-md text-sm font-medium text-brand-text-dark bg-slate-100 hover:bg-slate-200"
                        >
                            Sair
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default ParentHeader;