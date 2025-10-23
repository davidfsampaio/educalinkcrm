import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types.
import { Lead, LeadStatus, Task, RequiredDocument, CommunicationLog } from '../../types';
import Modal from '../common/Modal';
import ProtectedComponent from '../common/ProtectedComponent';

interface LeadDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead;
    onUpdateLead: (updatedLead: Lead) => void;
    onDeleteLead: (leadId: number) => void;
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
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const Trash2Icon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ isOpen, onClose, lead, onUpdateLead, onDeleteLead }) => {
    const [currentNotes, setCurrentNotes] = useState(lead.notes || '');

    useEffect(() => {
        setCurrentNotes(lead.notes || '');
    }, [lead]);

    const handleTaskToggle = (taskId: number) => {
        const updatedTasks = lead.tasks.map(task =>
            // FIX: Corrected property name from `isCompleted` to `is_completed`.
            task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
        );
        onUpdateLead({ ...lead, tasks: updatedTasks });
    };

    const handleSaveNotes = () => {
        onUpdateLead({ ...lead, notes: currentNotes });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes do Lead: ${lead.name}`} size="4xl">
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Panel */}
                    <div className="w-full md:w-1/3 space-y-4">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                            <h3 className="font-bold text-lg text-brand-text-dark">{lead.name}</h3>
                            {/* FIX: Corrected property name from `parentName` to `parent_name`. */}
                            <p className="text-brand-text">Responsável: {lead.parent_name}</p>
                            <p className="text-brand-text-light">{lead.contact}</p>
                            <p className="text-sm text-slate-500 mt-1">
                                {/* FIX: Corrected property name from `interestDate` to `interest_date`. */}
                                Interesse em: {new Date(lead.interest_date).toLocaleDateString('pt-BR')}
                            </p>
                            <div className="mt-2">
                                <select
                                    value={lead.status}
                                    onChange={(e) => onUpdateLead({ ...lead, status: e.target.value as LeadStatus })}
                                    className={`w-full px-3 py-1 text-sm font-semibold rounded-full border-0 focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary appearance-none ${getStatusClass(lead.status)}`}
                                >
                                    {Object.values(LeadStatus).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-brand-text-dark">Observações</h4>
                                {lead.notes !== currentNotes && (
                                    <button 
                                        onClick={handleSaveNotes}
                                        className="text-sm font-semibold text-brand-primary hover:underline"
                                    >
                                        Salvar
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={currentNotes}
                                onChange={(e) => setCurrentNotes(e.target.value)}
                                rows={4}
                                className="w-full text-brand-text text-sm bg-transparent focus:bg-white p-1 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
                                placeholder="Nenhuma observação."
                            />
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                            <h4 className="font-bold text-brand-text-dark mb-2">Próximas Ações</h4>
                            {lead.tasks.length > 0 ? (
                                <ul className="space-y-2">
                                    {lead.tasks.map(task => (
                                        <li key={task.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                // FIX: Corrected property name from `isCompleted` to `is_completed`.
                                                checked={task.is_completed}
                                                onChange={() => handleTaskToggle(task.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                            />
                                            {/* FIX: Corrected property name from `isCompleted` to `is_completed`. */}
                                            <label className={`ml-3 text-sm ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
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
                                {/* FIX: Corrected property name from `requiredDocuments` to `required_documents`. */}
                                {lead.required_documents.map(doc => (
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
                            {/* FIX: Corrected property name from `communicationLog` to `communication_log`. */}
                            {lead.communication_log.length > 0 ? (
                                <ul className="space-y-3">
                                    {/* FIX: Corrected property name from `communicationLog` to `communication_log`. */}
                                    {lead.communication_log.map(log => (
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
                <div className="flex justify-end pt-4 border-t">
                     <ProtectedComponent requiredPermission='delete_leads'>
                        <button 
                            onClick={() => onDeleteLead(lead.id)}
                            className="flex items-center justify-center bg-red-500/10 text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-500/20 transition-colors duration-300">
                            <Trash2Icon className="w-4 h-4 mr-2" />
                            Excluir Lead
                        </button>
                    </ProtectedComponent>
                </div>
            </div>
        </Modal>
    );
};

export default LeadDetailModal;