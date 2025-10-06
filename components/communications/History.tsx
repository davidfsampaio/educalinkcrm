
import React, { useState } from 'react';
// FIX: Corrected import path for types.
import { Communication } from '../../types';
import CommunicationDetailModal from './CommunicationDetailModal';

interface HistoryProps {
    communications: Communication[];
}

const History: React.FC<HistoryProps> = ({ communications }) => {
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
                        onClick={() => setSelectedComm(comm)}
                        className="p-4 border border-slate-200/80 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-brand-text-dark">{comm.title}</h3>
                                <p className="text-sm text-brand-text-light">
                                    Enviado para: <span className="font-medium">{comm.recipientGroup}</span>
                                </p>
                            </div>
                            <span className="text-sm text-brand-text-light whitespace-nowrap">
                                {new Date(comm.sentDate).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        <p className="mt-2 text-brand-text-dark truncate">
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
