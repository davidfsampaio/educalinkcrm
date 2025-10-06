import React, { useState } from 'react';
import Modal from '../common/Modal';

interface CreateLeadCaptureLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (campaignName: string) => void;
}

const CreateLeadCaptureLinkModal: React.FC<CreateLeadCaptureLinkModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [campaignName, setCampaignName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!campaignName.trim()) {
            setError('O nome da campanha é obrigatório.');
            return;
        }
        onCreate(campaignName.trim());
        // Reset state for next time
        setCampaignName('');
        setError('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Link de Captura">
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700">
                        Nome da Campanha
                    </label>
                    <input
                        type="text"
                        id="campaignName"
                        value={campaignName}
                        onChange={e => setCampaignName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        placeholder="Ex: Campanha Matrículas 2025"
                    />
                     <p className="mt-2 text-xs text-gray-500">Este nome é para seu controle interno e não será exibido aos pais.</p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">
                        Criar Link
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateLeadCaptureLinkModal;
