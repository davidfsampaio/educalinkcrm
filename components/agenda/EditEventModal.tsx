import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { AgendaItem, AgendaItemType } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditEvent: (event: AgendaItem) => void;
    eventItem: AgendaItem;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose, onEditEvent, eventItem }) => {
    const { settings } = useSettings();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState<AgendaItemType>(AgendaItemType.Event);
    const [classTarget, setClassTarget] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (eventItem) {
            setTitle(eventItem.title);
            setDescription(eventItem.description);
            setDate(eventItem.date);
            setType(eventItem.type);
            setClassTarget(eventItem.class_target);
        }
    }, [eventItem]);

    const handleSubmit = () => {
        if (!title || !description || !date || !classTarget) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        onEditEvent({
            ...eventItem,
            title,
            description,
            date,
            type,
            class_target: classTarget,
        });
        
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Evento na Agenda" size="2xl">
            <div className="space-y-4">
                 {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value as AgendaItemType)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                            {Object.values(AgendaItemType).map(itemType => (
                                <option key={itemType} value={itemType}>{itemType}</option>
                            ))}
                        </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Enviar Para</label>
                    <select value={classTarget} onChange={e => setClassTarget(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        <option value="Todas as Turmas">Todas as Turmas</option>
                        {settings.classes.map(className => (
                             <option key={className} value={className}>{className}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditEventModal;