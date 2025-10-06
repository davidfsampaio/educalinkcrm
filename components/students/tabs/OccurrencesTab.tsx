
import React from 'react';
// FIX: Corrected import path for types.
import { Occurrence } from '../../../types';

interface OccurrencesTabProps {
    occurrences: Occurrence[];
}

const getTypeClass = (type: string) => {
    switch(type) {
        case 'Pedagógica': return 'border-sky-500';
        case 'Disciplinar': return 'border-amber-500';
        case 'Atendimento': return 'border-teal-500';
        default: return 'border-gray-300';
    }
}

const OccurrencesTab: React.FC<OccurrencesTabProps> = ({ occurrences }) => {
     if (occurrences.length === 0) {
        return <p className="text-brand-text-dark">Nenhuma ocorrência registrada para este aluno.</p>;
    }

    return (
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
    );
};

export default OccurrencesTab;
