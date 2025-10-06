
import React, { useState } from 'react';
// FIX: Corrected import path for context.
import { useData } from '../contexts/DataContext';
// FIX: Corrected import path for types.
import { Lead, LeadStatus } from '../types';
import Card from './common/Card';
import AddLeadModal from './leads/AddLeadModal';
import LeadDetailModal from './leads/LeadDetailModal';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const LeadCard: React.FC<{ lead: Lead; onClick: () => void }> = ({ lead, onClick }) => (
    <div onClick={onClick} className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200">
        <h4 className="font-bold text-brand-text-dark">{lead.name}</h4>
        <p className="text-sm text-brand-text-light">{lead.parentName}</p>
        <p className="text-sm text-brand-text-light">{lead.contact}</p>
        <div className="text-xs text-slate-500 mt-2">
            Interesse em: {new Date(lead.interestDate).toLocaleDateString('pt-BR')}
        </div>
    </div>
);

const LeadsColumn: React.FC<{ title: string; leads: Lead[]; onLeadClick: (lead: Lead) => void }> = ({ title, leads, onLeadClick }) => (
    <div className="flex-1 bg-slate-100 rounded-xl p-4 min-w-[300px]">
        <h3 className="font-bold text-lg text-brand-text-dark mb-4 px-2">{title} ({leads.length})</h3>
        <div className="space-y-4 h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {leads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
            ))}
        </div>
    </div>
);


const Leads: React.FC = () => {
    const { leads } = useData();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
    };

    const handleCloseDetailModal = () => {
        setSelectedLead(null);
    };
    
    // This function will be a placeholder since we are not actually modifying data
    const handleAddLead = (newLeadData: Omit<Lead, 'id'>) => {
        console.log("New Lead Added (mock): ", newLeadData);
        // In a real app, you would call an API service to add the lead
        // and then update the local state, perhaps by re-fetching.
        setAddModalOpen(false);
    };

    const columns: { status: LeadStatus; title: string }[] = [
        { status: LeadStatus.New, title: 'Novos' },
        { status: LeadStatus.Contacted, title: 'Contactados' },
        { status: LeadStatus.VisitScheduled, title: 'Visita Agendada' },
        { status: LeadStatus.Enrolled, title: 'Matriculados' },
        { status: LeadStatus.Lost, title: 'Perdidos' },
    ];

    return (
        <>
            <div className="mb-4 flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-brand-text-dark">Funil de Admissões</h2>
                 <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Lead
                </button>
            </div>
            <div className="flex space-x-6 overflow-x-auto pb-4">
                {columns.map(col => (
                    <LeadsColumn
                        key={col.status}
                        title={col.title}
                        leads={leads.filter(lead => lead.status === col.status)}
                        onLeadClick={handleLeadClick}
                    />
                ))}
            </div>
            
            <AddLeadModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAddLead={handleAddLead}
            />

            {selectedLead && (
                <LeadDetailModal
                    isOpen={!!selectedLead}
                    onClose={handleCloseDetailModal}
                    lead={selectedLead}
                />
            )}
        </>
    );
};

export default Leads;
