
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';
// FIX: Corrected import path for types.
import { AgendaItem } from '../types';
import AddEventModal from './agenda/AddEventModal';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const SendIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);


const Agenda: React.FC = () => {
    const { agendaItems, loading } = useData();
    const [localAgendaItems, setLocalAgendaItems] = useState<AgendaItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            setLocalAgendaItems(agendaItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    }, [agendaItems, loading]);

    const handleAddEvent = (eventData: Omit<AgendaItem, 'id' | 'isSent'>) => {
        const newEvent: AgendaItem = {
            id: Date.now(), // Simple unique ID for mock purposes
            ...eventData,
            isSent: false,
        };
        setLocalAgendaItems(prevItems => [newEvent, ...prevItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsModalOpen(false);
    };

    const handleSend = (itemId: number) => {
         setLocalAgendaItems(prevItems => prevItems.map(item => 
            item.id === itemId ? { ...item, isSent: true } : item
        ));
        alert(`Enviando "${localAgendaItems.find(i => i.id === itemId)?.title}"... (Funcionalidade de exemplo)`);
    }

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-brand-text-dark">Agenda Online</h2>
                     <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Evento
                    </button>
                </div>
                <div className="space-y-4">
                    {localAgendaItems.map((item) => (
                        <div key={item.id} className="p-4 border border-slate-200/80 rounded-lg bg-slate-50/50 flex flex-col">
                            <div className="flex-grow">
                                <div className="flex justify-between">
                                    <h3 className="font-bold text-brand-text-dark">{item.title} ({item.type})</h3>
                                    <span className="text-sm text-brand-text-light">{item.date}</span>
                                </div>
                                <p className="text-sm text-brand-text">Para: {item.classTarget}</p>
                                <p className="mt-2 text-brand-text">{item.description}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200/80 flex justify-end items-center">
                               {item.isSent ? (
                                    <div className="flex items-center text-green-600 font-semibold text-sm">
                                        <CheckIcon className="w-5 h-5 mr-2" />
                                        <span>Enviado</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSend(item.id)}
                                        className="flex items-center bg-brand-secondary text-white font-bold py-2 px-3 rounded-lg hover:bg-teal-500 transition-colors duration-300 shadow-sm text-sm"
                                    >
                                        <SendIcon className="w-4 h-4 mr-2" />
                                        Enviar para os Pais
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <AddEventModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddEvent={handleAddEvent}
            />
        </>
    );
};

export default Agenda;
