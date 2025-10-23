import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useSettings } from '../../contexts/SettingsContext';
import { Communication } from '../../types';

interface EditCommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    communication: Communication;
    onSave: (updatedComm: Communication) => void;
}

const EditCommunicationModal: React.FC<EditCommunicationModalProps> = ({ isOpen, onClose, communication, onSave }) => {
    const { settings } = useSettings();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [recipientGroup, setRecipientGroup] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (communication) {
            setTitle(communication.title);
            setContent(communication.content);
            setRecipientGroup(communication.recipient_group);
        }
    }, [communication]);

    const handleSave = () => {
        if (!title || !content || !recipientGroup) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        onSave({ 
            ...communication, 
            title, 
            content, 
            recipient_group: recipientGroup 
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Comunicado: ${communication.title}`}>
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Enviar Para</label>
                    <select
                        value={recipientGroup}
                        onChange={e => setRecipientGroup(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    >
                        <option value="Todos os Pais">Todos os Pais</option>
                        <option value="Todos">Todos (Pais e Funcionários)</option>
                        {settings.classes.map(className => (
                            <option key={className} value={`Pais - ${className}`}>{`Pais - ${className}`}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={8}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditCommunicationModal;
