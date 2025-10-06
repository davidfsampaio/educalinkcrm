
import React, { useState } from 'react';
import Modal from '../common/Modal';
// FIX: Corrected import path for types.
import { AgendaItem, AgendaItemType } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddEvent: (event: Omit<AgendaItem, 'id' | 'isSent'>) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onAddEvent }) => {
    const { settings } = useSettings();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [type, setType] = useState<AgendaItemType>(AgendaItemType.Event);
    const [classTarget, setClassTarget] = useState('Todas as Turmas');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!title || !description || !date || !classTarget) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        onAddEvent({
            title,
            description,
            date,
            type,
            classTarget,
        });
        
        // Reset form and close
        setTitle('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setType(AgendaItemType.Event);
        setClassTarget('Todas as Turmas');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Evento na Agenda" size="2xl">
            <div className="space-y-4">
                 {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
                        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select id="type" value={type} onChange={e => setType(e.target.value as AgendaItemType)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            {Object.values(AgendaItemType).map(itemType => (
                                <option key={itemType} value={itemType}>{itemType}</option>
                            ))}
                        </select>
                    </div>
                 </div>
                 <div>
                    <label htmlFor="classTarget" className="block text-sm font-medium text-gray-700">Enviar Para</label>
                    <select id="classTarget" value={classTarget} onChange={e => setClassTarget(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                        <option value="Todas as Turmas">Todas as Turmas</option>
                        {settings.classes.map(className => (
                             <option key={className} value={className}>{className}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Salvar Evento
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddEventModal;
