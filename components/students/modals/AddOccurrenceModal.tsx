
import React, { useState } from 'react';
import Modal from '../../common/Modal';
import { Occurrence } from '../../../types';

interface AddOccurrenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (occurrenceData: Omit<Occurrence, 'id'>) => void;
}

const AddOccurrenceModal: React.FC<AddOccurrenceModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'Pedagógica' | 'Disciplinar' | 'Atendimento'>('Pedagógica');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!description) {
            setError('A descrição é obrigatória.');
            return;
        }
        onAdd({ date, type, description });
        handleClose();
    };

    const handleClose = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setType('Pedagógica');
        setDescription('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Nova Ocorrência">
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                            <option>Pedagógica</option>
                            <option>Disciplinar</option>
                            <option>Atendimento</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" placeholder="Descreva a ocorrência..." />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">Adicionar Ocorrência</button>
                </div>
            </div>
        </Modal>
    );
};

export default AddOccurrenceModal;
