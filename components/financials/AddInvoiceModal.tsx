


import React, { useState } from 'react';
import Modal from '../common/Modal';
// FIX: Corrected import path for types.
import { Student, Invoice } from '../../types';

interface AddInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Corrected Omit type to use 'schoolId' (camelCase) instead of 'school_id' (snake_case) to correctly match the property in the Invoice type and resolve the TypeScript error.
    onAddInvoice: (invoiceData: Omit<Invoice, 'id' | 'schoolId' | 'status' | 'payments' | 'studentName'> & { studentId: number }) => void;
    students: Student[];
}

const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({ isOpen, onClose, onAddInvoice, students }) => {
    const [studentId, setStudentId] = useState<number | ''>('');
    const [amount, setAmount] = useState<number | ''>('');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = () => {
        if (!studentId || !amount || !dueDate) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        onAddInvoice({
            studentId,
            amount,
            dueDate,
        });
        
        // Reset form
        setStudentId('');
        setAmount('');
        setDueDate('');
        setError('');
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Nova Fatura" size="lg">
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label htmlFor="student" className="block text-sm font-medium text-gray-700">Aluno</label>
                    <select
                        id="student"
                        value={studentId}
                        onChange={(e) => setStudentId(Number(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    >
                        <option value="">Selecione um aluno</option>
                        {students.map(student => (
                            <option key={student.id} value={student.id}>{student.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        placeholder="850.00"
                    />
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                    <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    />
                </div>
                 <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Salvar Fatura
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddInvoiceModal;