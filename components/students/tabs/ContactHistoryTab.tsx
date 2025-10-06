
import React from 'react';
// FIX: Corrected import path for types.
import { CommunicationLog } from '../../../types';

interface ContactHistoryTabProps {
    log: CommunicationLog[];
}

const getIconForType = (type: string) => {
    switch(type) {
        case 'Email': return '✉️';
        case 'Ligação': return '📞';
        case 'Reunião': return '👥';
        case 'Sistema': return '💻';
        default: return '📝';
    }
}

const ContactHistoryTab: React.FC<ContactHistoryTabProps> = ({ log }) => {
     if (log.length === 0) {
        return <p className="text-brand-text-dark">Nenhum registro de contato encontrado.</p>;
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {log.map((entry, entryIdx) => (
                    <li key={entry.id}>
                        <div className="relative pb-8">
                             {entryIdx !== log.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-8 ring-white">
                                        {getIconForType(entry.type)}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm text-brand-text-dark">
                                            {entry.type} em <time dateTime={entry.date}>{new Date(entry.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</time>
                                        </p>
                                        <p className="font-medium text-brand-text-dark">{entry.summary}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ContactHistoryTab;
