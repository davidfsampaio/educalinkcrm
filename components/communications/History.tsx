import React, { useState } from 'react';
// FIX: Corrected import path for types.
import { Communication } from '../../types';
import CommunicationDetailModal from './CommunicationDetailModal';
import ProtectedComponent from '../common/ProtectedComponent';

const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const Trash2Icon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);


interface HistoryProps {
    communications: Communication[];
    onEdit: (comm: Communication) => void;
    onDelete: (commId: number) => void;
}

const History: React.FC<HistoryProps> = ({ communications, onEdit, onDelete }) => {
    const [selectedComm, setSelectedComm] = useState<Communication | null>(null);

    if (communications.length === 0) {
        return <p className="text-brand-text-dark text-center">Nenhum comunicado enviado ainda.</p>;
    }

    return (
        <>
            <div className="space-y-4">
                {communications.map((comm) => (
                    <div
                        key={comm.id}
                        className="p-4 border border-slate-200/80 rounded-lg bg-white hover:bg-slate-50 transition-colors group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="cursor-pointer flex-grow" onClick={() => setSelectedComm(comm)}>
                                <h3 className="font-bold text-brand-text-dark">{comm.title}</h3>
                                <p className="text-sm text-brand-text-light">
                                    {/* FIX: Corrected property name from `recipientGroup` to `recipient_group`. */}
                                    Enviado para: <span className="font-medium">{comm.recipient_group}</span>
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ProtectedComponent requiredPermission='edit_communications'>
                                    <button onClick={() => onEdit(comm)} className="text-slate-500 hover:text-brand-primary" title="Editar">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                </ProtectedComponent>
                                <ProtectedComponent requiredPermission='delete_communications'>
                                    <button onClick={() => onDelete(comm.id)} className="text-slate-500 hover:text-red-500" title="Excluir">
                                        <Trash2Icon className="w-5 h-5" />
                                    </button>
                                </ProtectedComponent>
                            </div>
                            <span className="text-sm text-brand-text-light whitespace-nowrap ml-4">
                                {/* FIX: Corrected property name from `sentDate` to `sent_date`. */}
                                {new Date(comm.sent_date).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        <p className="mt-2 text-brand-text-dark truncate cursor-pointer" onClick={() => setSelectedComm(comm)}>
                            {comm.content}
                        </p>
                    </div>
                ))}
            </div>

            {selectedComm && (
                <CommunicationDetailModal
                    isOpen={!!selectedComm}
                    onClose={() => setSelectedComm(null)}
                    communication={selectedComm}
                />
            )}
        </>
    );
};

export default History;