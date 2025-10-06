
import React, { useState } from 'react';
// FIX: Corrected import path for types.
import { Lead, LeadStatus, Task, RequiredDocument, CommunicationLog } from '../../types';
import Modal from '../common/Modal';

interface LeadDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead;
}

const getStatusClass = (status: LeadStatus) => {
    switch (status) {
        case LeadStatus.New: return 'bg-blue-100 text-blue-800';
        case LeadStatus.Contacted: return 'bg-yellow-100 text-yellow-800';
        case LeadStatus.VisitScheduled: return 'bg-purple-100 text-purple-800';
        case LeadStatus.Enrolled: return 'bg-green-100 text-green-800';
        case LeadStatus.Lost: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ isOpen, onClose, lead }) => {
    // In a real app, this state would be handled and updated via an API
    const [tasks, setTasks] = useState<Task[]>(lead.tasks);

    const handleTaskToggle = (taskId: number) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes do Lead: ${lead.name}`} size="4xl">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Panel */}
                <div className="w-full md:w-1/3 space-y-4">
                     <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                        <h3 className="font-bold text-lg text-brand-text-dark">{lead.name}</h3>
                        <p className="text-brand-text">Responsável: {lead.parentName}</p>
                        <p className="text-brand-text-light">{lead.contact}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Interesse em: {new Date(lead.interestDate).toLocaleDateString('pt-BR')}
                        </p>
                        <div className="mt-2">
                             <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(lead.status)}`}>
                                {lead.status}
                            </span>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                        <h4 className="font-bold text-brand-text-dark mb-2">Observações</h4>
                        <p className="text-brand-text text-sm">{lead.notes || 'Nenhuma observação.'}</p>
                    </div>
                     <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                        <h4 className="font-bold text-brand-text-dark mb-2">Próximas Ações</h4>
                        {tasks.length > 0 ? (
                            <ul className="space-y-2">
                                {tasks.map(task => (
                                    <li key={task.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={task.isCompleted}
                                            onChange={() => handleTaskToggle(task.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                        />
                                        <label className={`ml-3 text-sm ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                            {task.description}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500">Nenhuma tarefa pendente.</p>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-full md:w-2/3 space-y-4">
                     <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                        <h4 className="font-bold text-brand-text-dark mb-2">Documentos Necessários</h4>
                        <ul className="space-y-1">
                            {lead.requiredDocuments.map(doc => (
                                <li key={doc.name} className="flex items-center justify-between text-sm">
                                    <span className="text-brand-text-dark">{doc.name}</span>
                                    {doc.status === 'Recebido' ? (
                                        <span className="flex items-center text-green-600 font-semibold">
                                            <CheckIcon className="w-4 h-4 mr-1"/> Recebido
                                        </span>
                                    ) : (
                                         <span className="text-yellow-600 font-semibold">Pendente</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                     </div>
                     <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                        <h4 className="font-bold text-brand-text-dark mb-2">Histórico de Contato</h4>
                        {lead.communicationLog.length > 0 ? (
                            <ul className="space-y-3">
                                {lead.communicationLog.map(log => (
                                    <li key={log.id} className="text-sm border-l-2 pl-3 border-brand-primary/50">
                                        <p className="font-semibold text-brand-text-dark">{log.type} em {new Date(log.date).toLocaleDateString('pt-BR')}</p>
                                        <p className="text-slate-600">{log.summary}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500">Nenhum contato registrado.</p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default LeadDetailModal;