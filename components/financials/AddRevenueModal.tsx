import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Revenue, RevenueCategory } from '../../types';

interface AddRevenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Update prop type to omit 'school_id' as it's handled by the DataContext.
    onAddRevenue: (revenueData: Omit<Revenue, 'id' | 'school_id'>) => void;
}

const AddRevenueModal: React.FC<AddRevenueModalProps> = ({ isOpen, onClose, onAddRevenue }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<RevenueCategory>(RevenueCategory.Other);
    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    
    const handleSubmit = () => {
        if (!description || !amount || !date || !category) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        onAddRevenue({
            description,
            category,
            amount,
            date,
        });
        
        // Reset form
        setDescription('');
        setCategory(RevenueCategory.Other);
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setError('');
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Nova Receita" size="lg">
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label htmlFor="rev-description" className="block text-sm font-medium text-gray-700">Descrição</label>
                    <input type="text" id="rev-description" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="rev-category" className="block text-sm font-medium text-gray-700">Categoria</label>
                    <select id="rev-category" value={category} onChange={e => setCategory(e.target.value as RevenueCategory)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                       {Object.values(RevenueCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="rev-amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                    <input type="number" id="rev-amount" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="500.00" />
                </div>
                <div>
                    <label htmlFor="rev-date" className="block text-sm font-medium text-gray-700">Data</label>
                    <input type="date" id="rev-date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Salvar Receita
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddRevenueModal;
