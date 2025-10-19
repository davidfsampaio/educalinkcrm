import React from 'react';
import { CommunicationLog } from '../../../types';
import ProtectedComponent from '../../common/ProtectedComponent';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

interface ContactHistoryTabProps {
    log: CommunicationLog[];
    onAdd?: () => void;
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

const ContactHistoryTab: React.FC<ContactHistoryTabProps> = ({ log, onAdd }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-text-dark">Histórico de Contato</h3>
                {onAdd && (
                    <ProtectedComponent requiredPermission='edit_students'>
                        <button 
                            onClick={onAdd}
                            className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Contato
                        </button>
                    </ProtectedComponent>
                )}
            </div>
            {log.length === 0 ? (
                <p className="text-brand-text-dark">Nenhum registro de contato encontrado.</p>
            ) : (
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
            )}
        </div>
    );
};

export default ContactHistoryTab;