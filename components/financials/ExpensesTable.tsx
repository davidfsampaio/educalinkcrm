import React from 'react';
import { Expense } from '../../types';
import ProtectedComponent from '../common/ProtectedComponent';

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);

const Trash2Icon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
);

interface ExpensesTableProps {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (expenseId: number) => void;
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({ expenses, onEdit, onDelete }) => {
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-brand-text-dark">
                {expenses.map((expense) => (
                    <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(expense.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{expense.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{expense.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-red-600 font-medium">
                            - {expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <ProtectedComponent requiredPermission='manage_expenses'>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => onEdit(expense)} className="text-brand-primary hover:text-sky-700" title="Editar">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onDelete(expense.id)} className="text-red-500 hover:text-red-700" title="Excluir">
                                        <Trash2Icon className="w-5 h-5" />
                                    </button>
                                </div>
                            </ProtectedComponent>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ExpensesTable;