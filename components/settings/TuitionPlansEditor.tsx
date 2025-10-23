import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../common/Card';
import Modal from '../common/Modal';
import { TuitionPlan } from '../../types';

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);
const Trash2Icon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
);
const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: Omit<TuitionPlan, 'id' | 'school_id'>) => void;
    plan?: Omit<TuitionPlan, 'school_id'>;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ isOpen, onClose, onSave, plan }) => {
    const [name, setName] = useState(plan?.name || '');
    const [amount, setAmount] = useState<number | ''>(plan?.amount || '');
    const [error, setError] = useState('');
    
    const handleSubmit = () => {
        if (!name || !amount) {
            setError('Nome e valor são obrigatórios.');
            return;
        }
        onSave(plan ? { ...plan, name, amount } : { name, amount });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={plan ? 'Editar Plano' : 'Novo Plano de Mensalidade'}>
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Nome do Plano</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                    <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                </div>
                 <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">Salvar</button>
                </div>
            </div>
        </Modal>
    );
};


const TuitionPlansEditor: React.FC = () => {
    const { tuitionPlans, addTuitionPlan, updateTuitionPlan, deleteTuitionPlan } = useData();
    const [editingPlan, setEditingPlan] = useState<Omit<TuitionPlan, 'school_id'> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (plan?: Omit<TuitionPlan, 'school_id'>) => {
        setEditingPlan(plan || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleSave = (planData: Omit<TuitionPlan, 'id' | 'school_id'>) => {
        if (editingPlan) {
            updateTuitionPlan({ ...editingPlan, ...planData });
        } else {
            addTuitionPlan(planData);
        }
    };
    
    const handleDelete = (planId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este plano? Alunos associados a ele ficarão sem plano.')) {
            deleteTuitionPlan(planId);
        }
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-brand-text-dark border-b pb-2">Planos de Mensalidade</h2>
                    <button onClick={() => handleOpenModal()} className="flex items-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Plano
                    </button>
                </div>
                <div className="mt-4 space-y-2">
                    {tuitionPlans.map(plan => (
                        <div key={plan.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                            <div>
                                <span className="font-semibold text-brand-text-dark">{plan.name}</span>
                                <span className="text-brand-text-light ml-4">{plan.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button onClick={() => handleOpenModal(plan)} className="text-brand-primary hover:text-sky-700"><EditIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleDelete(plan.id)} className="text-red-500 hover:text-red-70á00"><Trash2Icon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                    {tuitionPlans.length === 0 && (
                        <p className="text-center text-brand-text-light py-4">Nenhum plano de mensalidade cadastrado.</p>
                    )}
                </div>
            </Card>

            {isModalOpen && (
                <PlanFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    plan={editingPlan || undefined}
                />
            )}
        </>
    );
};

export default TuitionPlansEditor;