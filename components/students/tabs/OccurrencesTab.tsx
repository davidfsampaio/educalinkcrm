
import React from 'react';
import { Occurrence } from '../../../types';
import ProtectedComponent from '../../common/ProtectedComponent';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

interface OccurrencesTabProps {
    occurrences: Occurrence[];
    onAdd: () => void;
}

const getTypeClass = (type: string) => {
    switch(type) {
        case 'Pedagógica': return 'border-sky-500';
        case 'Disciplinar': return 'border-amber-500';
        case 'Atendimento': return 'border-teal-500';
        default: return 'border-gray-300';
    }
}

const OccurrencesTab: React.FC<OccurrencesTabProps> = ({ occurrences, onAdd }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-text-dark">Ocorrências</h3>
                <ProtectedComponent requiredPermission='edit_students'>
                    <button 
                        onClick={onAdd}
                        className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Ocorrência
                    </button>
                </ProtectedComponent>
            </div>
            {occurrences.length === 0 ? (
                <p className="text-brand-text-dark">Nenhuma ocorrência registrada para este aluno.</p>
            ) : (
                <div className="space-y-4">
                    {occurrences.map((occurrence) => (
                        <div key={occurrence.id} className={`p-4 border-l-4 ${getTypeClass(occurrence.type)} bg-slate-50 rounded-r-lg`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-brand-text-dark">{occurrence.type}</p>
                                    <p className="text-sm text-brand-text-dark">{new Date(occurrence.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                </div>
                            </div>
                            <p className="mt-2 text-brand-text-dark">{occurrence.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OccurrencesTab;
