
import React, { useState } from 'react';
import Modal from '../../common/Modal';
import { Grade } from '../../../types';

interface AddGradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (gradeData: Grade) => void;
}

const AddGradeModal: React.FC<AddGradeModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [subject, setSubject] = useState('');
    const [score, setScore] = useState<number | ''>('');
    const [term, setTerm] = useState('1º Trimestre');
    const [type, setType] = useState('Prova');
    const [weight, setWeight] = useState(1);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!subject || score === '' || score < 0 || score > 10) {
            setError('Por favor, preencha a disciplina e uma nota válida (0-10).');
            return;
        }

        onAdd({ subject, score, term, type, weight });
        handleClose();
    };
    
    const handleClose = () => {
        setSubject('');
        setScore('');
        setTerm('1º Trimestre');
        setType('Prova');
        setWeight(1);
        setError('');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Nova Nota">
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Disciplina</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Ex: Matemática" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nota (0-10)</label>
                        <input type="number" value={score} onChange={e => setScore(parseFloat(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Período</label>
                        <select value={term} onChange={e => setTerm(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                            <option>1º Trimestre</option>
                            <option>2º Trimestre</option>
                            <option>3º Trimestre</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Avaliação</label>
                    <input type="text" value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" placeholder="Ex: Prova, Trabalho, Participação" />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">Adicionar Nota</button>
                </div>
            </div>
        </Modal>
    );
};

export default AddGradeModal;
