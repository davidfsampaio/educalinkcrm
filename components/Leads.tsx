
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Lead, LeadStatus } from '../types';
import Card from './common/Card';
import AddLeadModal from './leads/AddLeadModal';
import LeadDetailModal from './leads/LeadDetailModal';
import ProtectedComponent from './common/ProtectedComponent';
import LeadCaptureLinksModal from './leads/LeadCaptureLinksModal';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    // FIX: Corrected typo in viewBox attribute.
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const LinkIcon: React.FC<{className?: string}> = ({ className }) => (
    // FIX: Corrected typo in viewBox attribute.
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
);

const LeadCard: React.FC<{ lead: Lead; onClick: () => void }> = ({ lead, onClick }) => (
    <div onClick={onClick} className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200">
        <h4 className="font-bold text-brand-text-dark">{lead.name}</h4>
        {/* FIX: Corrected property name from `parentName` to `parent_name`. */}
        <p className="text-sm text-brand-text-light">{lead.parent_name}</p>
        <p className="text-sm text-brand-text-light">{lead.contact}</p>
        <div className="text-xs text-slate-500 mt-2">
            {/* FIX: Corrected property name from `interestDate` to `interest_date`. */}
            Interesse em: {new Date(lead.interest_date).toLocaleDateString('pt-BR')}
        </div>
    </div>
);

const LeadsColumn: React.FC<{ title: string; leads: Lead[]; onLeadClick: (lead: Lead) => void }> = ({ title, leads, onLeadClick }) => (
    <div className="flex-1 bg-slate-100 rounded-xl p-4 min-w-[300px]">
        <h3 className="font-bold text-lg text-brand-text-dark mb-4 px-2">{title} ({leads.length})</h3>
        <div className="space-y-4 h-[calc(100vh-280px)] overflow-y-auto pr-2">
            {leads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
            ))}
        </div>
    </div>
);

interface LeadsProps {
    initialAction?: string | null; // New prop for PWA shortcuts
    initialLead?: Lead | null;
}

const Leads: React.FC<LeadsProps> = ({ initialAction, initialLead }) => {
    const { leads, addLead, updateLead, deleteLead } = useData();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isLinkManagerOpen, setLinkManagerOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    useEffect(() => {
        if (initialAction === 'new_lead') {
            setAddModalOpen(true);
        }
        if (initialLead) {
            const leadToSelect = leads.find(l => l.id === initialLead.id);
            if (leadToSelect) {
                setSelectedLead(leadToSelect);
            }
        }
    }, [initialAction, initialLead, leads]);

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
    };

    const handleCloseDetailModal = () => {
        setSelectedLead(null);
    };
    
    const handleAddLead = (newLeadData: Omit<Lead, 'id' | 'school_id'>) => {
        addLead(newLeadData);
        setAddModalOpen(false);
    };
    
    const handleUpdateLead = (updatedLead: Lead) => {
        updateLead(updatedLead);
        // If the updated lead is the one currently selected, update the selectedLead state as well
        if (selectedLead && selectedLead.id === updatedLead.id) {
            setSelectedLead(updatedLead);
        }
    };

    const handleDeleteLead = (leadId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este lead?')) {
            deleteLead(leadId);
            handleCloseDetailModal();
        }
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
            <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h2 className="text-2xl font-bold text-brand-text-dark">Funil de Admissões</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                    <ProtectedComponent requiredPermission='manage_lead_forms'>
                        <button
                            onClick={() => setLinkManagerOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center bg-white text-brand-primary border border-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-sky-50 transition-colors duration-300 shadow-sm"
                        >
                            <LinkIcon className="w-5 h-5 mr-2" />
                            Links de Captura
                        </button>
                    </ProtectedComponent>
                     <ProtectedComponent requiredPermission='create_leads'>
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Lead
                        </button>
                    </ProtectedComponent>
                </div>
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

            <LeadCaptureLinksModal
                isOpen={isLinkManagerOpen}
                onClose={() => setLinkManagerOpen(false)}
            />

            {selectedLead && (
                <LeadDetailModal
                    isOpen={!!selectedLead}
                    onClose={handleCloseDetailModal}
                    lead={selectedLead}
                    onUpdateLead={handleUpdateLead}
                    onDeleteLead={handleDeleteLead}
                />
            )}
        </>
    );
};

export default Leads;
