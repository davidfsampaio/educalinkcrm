import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for context.
import { useData } from '../contexts/DataContext';
// FIX: Corrected import path for types.
import { Communication } from '../types';
import Composer from './communications/Composer';
import History from './communications/History';

const Communications: React.FC = () => {
    const { communications, addCommunication } = useData();
    const [activeTab, setActiveTab] = useState<'composer' | 'history'>('composer');

    const handleSendCommunication = (newComm: Omit<Communication, 'id' | 'sent_date' | 'school_id'>) => {
        addCommunication(newComm);
        setActiveTab('history'); // Switch to history tab after sending
    };
    
    // Sort communications for display
    // FIX: Corrected property name from `sentDate` to `sent_date`.
    const sortedCommunications = [...communications].sort((a, b) => new Date(b.sent_date).getTime() - new Date(a.sent_date).getTime());

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('composer')}
                            className={`${
                                activeTab === 'composer'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Criar Comunicado
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`${
                                activeTab === 'history'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Histórico de Envios
                        </button>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'composer' && <Composer onSend={handleSendCommunication} />}
                    {activeTab === 'history' && <History communications={sortedCommunications} />}
                </div>
            </div>
        </div>
    );
};

export default Communications;