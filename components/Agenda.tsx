import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';
import { AgendaItem } from '../types';
import AddEventModal from './agenda/AddEventModal';
import ProtectedComponent from './common/ProtectedComponent';

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
    const { agendaItems, addAgendaItem, updateAgendaItem } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddEvent = (eventData: Omit<AgendaItem, 'id' | 'is_sent' | 'school_id'>) => {
        addAgendaItem(eventData);
        setIsModalOpen(false);
    };

    const handleSend = (itemId: number) => {
        const itemToSend = agendaItems.find(i => i.id === itemId);
        if (itemToSend) {
            // FIX: Corrected property name from `isSent` to `is_sent`.
            updateAgendaItem({ ...itemToSend, is_sent: true });
            alert(`Enviando "${itemToSend.title}"... (Funcionalidade de exemplo)`);
        }
    }
    
    const sortedAgendaItems = [...agendaItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-brand-text-dark">Agenda Online</h2>
                    <ProtectedComponent requiredPermission='create_agenda_items'>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Evento
                        </button>
                    </ProtectedComponent>
                </div>
                <div className="space-y-4">
                    {sortedAgendaItems.map((item) => (
                        <div key={item.id} className="p-4 border border-slate-200/80 rounded-lg bg-slate-50/50 flex flex-col">
                            <div className="flex-grow">
                                <div className="flex justify-between">
                                    <h3 className="font-bold text-brand-text-dark">{item.title} ({item.type})</h3>
                                    <span className="text-sm text-brand-text-light">{item.date}</span>
                                </div>
                                {/* FIX: Corrected property name from `classTarget` to `class_target`. */}
                                <p className="text-sm text-brand-text">Para: {item.class_target}</p>
                                <p className="mt-2 text-brand-text">{item.description}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200/80 flex justify-end items-center">
                               {/* FIX: Corrected property name from `isSent` to `is_sent`. */}
                               {item.is_sent ? (
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