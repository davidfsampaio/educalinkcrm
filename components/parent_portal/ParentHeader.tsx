import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface ParentHeaderProps {
    studentName: string;
    onLogout: () => void;
}

const ParentHeader: React.FC<ParentHeaderProps> = ({ studentName, onLogout }) => {
    const { settings } = useSettings();
    const { schoolInfo } = settings;

    return (
        <header className="bg-white shadow-sm sticky top-0 z-10 border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-4">
                        {schoolInfo.logoUrl && <img src={schoolInfo.logoUrl} alt="Logo" className="h-12 w-auto" />}
                        <div>
                            <h1 className="text-xl font-bold text-brand-text-dark">{schoolInfo.name}</h1>
                            <p className="text-sm text-brand-text">Portal do Responsável</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                         <p className="hidden md:block text-brand-text-dark font-semibold">Aluno(a): {studentName}</p>
                         <button
                            onClick={onLogout}
                            className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-brand-text-dark bg-slate-100 hover:bg-slate-200"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ParentHeader;
