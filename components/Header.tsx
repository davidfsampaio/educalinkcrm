
import React from 'react';
// FIX: Corrected import path for types.
import { View } from '../types';

interface HeaderProps {
    currentView: View;
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

const Header: React.FC<HeaderProps> = ({ currentView }) => {
    const title = viewTitles[currentView];

    return (
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-brand-text-dark">{title}</h1>
            <div className="flex items-center space-x-4">
                <button className="relative text-brand-text-light hover:text-brand-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </button>
                <div className="flex items-center space-x-2">
                    <img className="h-10 w-10 rounded-full" src="https://picsum.photos/seed/user/100/100" alt="User Avatar" />
                    <div>
                        <p className="font-semibold text-brand-text-dark">Diretor(a)</p>
                        <p className="text-sm text-brand-text-light">Admin</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
