import React, { useState } from 'react';
import Modal from '../common/Modal';
// FIX: Corrected import path for types.
import { Lead, LeadStatus } from '../../types';

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Aligned prop type with DataContext, which handles adding id and school_id.
    onAddLead: (lead: Omit<Lead, 'id' | 'school_id'>) => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onAddLead }) => {
    const [name, setName] = useState('');
    const [parentName, setParentName] = useState('');
    const [contact, setContact] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!name || !parentName || !contact) {
            setError('Nome do Lead, Nome do Responsável e Contato são obrigatórios.');
            return;
        }

        // FIX: Corrected the type of the newLead object to match what the onAddLead function expects.
        const newLead: Omit<Lead, 'id' | 'school_id'> = {
            name,
            parentName,
            contact,
            notes,
            status: LeadStatus.New,
            interestDate: new Date().toISOString().split('T')[0],
            tasks: [{ id: 1, description: 'Realizar primeiro contato', isCompleted: false }],
            isConverted: false,
            requiredDocuments: [
                { name: 'Certidão de Nascimento', status: 'Pendente' },
                { name: 'RG/CPF do Responsável', status: 'Pendente' },
                { name: 'Comprovante de Residência', status: 'Pendente' },
                { name: 'Carteira de Vacinação', status: 'Pendente' },
            ],
            communicationLog: [],
        };

        onAddLead(newLead);
        
        // Reset form and close
        setName('');
        setParentName('');
        setContact('');
        setNotes('');
        setError('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Lead" size="2xl">
            <div className="space-y-4">
                 {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label htmlFor="leadName" className="block text-sm font-medium text-gray-700">Nome do Lead (Ex: Família Silva)</label>
                    <input type="text" id="leadName" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">Nome do Responsável</label>
                    <input type="text" id="parentName" value={parentName} onChange={e => setParentName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contato (Telefone/Email)</label>
                    <input type="text" id="contact" value={contact} onChange={e => setContact(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Observações Iniciais</label>
                    <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Salvar Lead
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddLeadModal;