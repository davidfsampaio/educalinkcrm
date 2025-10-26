
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';
import { Invoice, PaymentStatus, Student, StudentStatus, Expense, Revenue } from '../types';
import AddInvoiceModal from './financials/AddInvoiceModal';
import EditInvoiceModal from './financials/EditInvoiceModal';
import AddExpenseModal from './financials/AddExpenseModal';
import AddRevenueModal from './financials/AddRevenueModal';
import ExpensesTable from './financials/ExpensesTable';
import RevenuesTable from './financials/RevenuesTable';
import ProtectedComponent from './common/ProtectedComponent';
import EditExpenseModal from './financials/EditExpenseModal';
import EditRevenueModal from './financials/EditRevenueModal';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    // FIX: Corrected typo in viewBox attribute.
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    // FIX: Corrected typo in viewBox attribute.
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const Trash2Icon: React.FC<{className?: string}> = ({ className }) => (
    // FIX: Corrected typo in viewBox attribute.
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);


const getStatusClass = (status: PaymentStatus) => {
    switch(status) {
        case PaymentStatus.Paid: return 'bg-green-100 text-green-800';
        case PaymentStatus.Pending: return 'bg-yellow-100 text-yellow-800';
        case PaymentStatus.Overdue: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

type FinancialsTab = 'invoices' | 'revenues' | 'expenses';

interface FinancialsProps {
    initialInvoice?: Invoice | null;
}

const Financials: React.FC<FinancialsProps> = ({ initialInvoice }) => {
    const { 
        invoices, 
        students, 
        expenses,
        revenues,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addExpense,
        updateExpense,
        deleteExpense,
        addRevenue,
        updateRevenue,
        deleteRevenue,
    } = useData();

    const [activeTab, setActiveTab] = useState<FinancialsTab>('invoices');
    
    const [isAddInvoiceModalOpen, setAddInvoiceModalOpen] = useState(false);
    const [isAddExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
    const [isAddRevenueModalOpen, setAddRevenueModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);

    useEffect(() => {
        if (initialInvoice) {
            const invoiceToSelect = invoices.find(i => i.id === initialInvoice.id);
            if (invoiceToSelect) {
                setEditingInvoice(invoiceToSelect);
            }
        }
    }, [initialInvoice, invoices]);

    const handleAddInvoiceSubmit = (newInvoiceData: Omit<Invoice, 'id' | 'status' | 'payments' | 'student_name' | 'school_id'> & { student_id: number }) => {
        addInvoice(newInvoiceData);
        setAddInvoiceModalOpen(false);
    };

    const handleUpdateInvoiceSubmit = (updatedInvoice: Invoice) => {
        updateInvoice(updatedInvoice);
        setEditingInvoice(null);
    };

    const handleDeleteInvoice = (invoiceId: string) => {
        if (window.confirm('Tem certeza de que deseja excluir esta fatura? Esta ação não pode ser desfeita.')) {
            deleteInvoice(invoiceId);
        }
    };
    
    const handleAddExpenseSubmit = (newExpenseData: Omit<Expense, 'id' | 'school_id'>) => {
        addExpense(newExpenseData);
        setAddExpenseModalOpen(false);
    };

    const handleUpdateExpenseSubmit = (updatedExpense: Expense) => {
        updateExpense(updatedExpense);
        setEditingExpense(null);
    };

    const handleDeleteExpense = (expenseId: number) => {
        if (window.confirm('Tem certeza de que deseja excluir esta despesa?')) {
            deleteExpense(expenseId);
        }
    };
    
    const handleAddRevenueSubmit = (newRevenueData: Omit<Revenue, 'id' | 'school_id'>) => {
        addRevenue(newRevenueData);
        setAddRevenueModalOpen(false);
    };

    const handleUpdateRevenueSubmit = (updatedRevenue: Revenue) => {
        updateRevenue(updatedRevenue);
        setEditingRevenue(null);
    };

    const handleDeleteRevenue = (revenueId: number) => {
        if (window.confirm('Tem certeza de que deseja excluir esta receita?')) {
            deleteRevenue(revenueId);
        }
    };

    const activeStudents = students.filter(s => s.status === StudentStatus.Active);
    
    const renderHeaderButton = () => {
        switch (activeTab) {
            case 'invoices':
                return (
                    <ProtectedComponent requiredPermission='create_invoices'>
                        <button
                            onClick={() => setAddInvoiceModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Fatura
                        </button>
                    </ProtectedComponent>
                );
            case 'revenues':
                return (
                    <ProtectedComponent requiredPermission='manage_revenues'> 
                        <button
                            onClick={() => setAddRevenueModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Receita
                        </button>
                    </ProtectedComponent>
                );
            case 'expenses':
                return (
                    <ProtectedComponent requiredPermission='manage_expenses'>
                        <button
                            onClick={() => setAddExpenseModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Despesa
                        </button>
                    </ProtectedComponent>
                );
            default:
                return null;
        }
    };
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'invoices':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-brand-text-dark">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{invoice.id}</td>
                                    {/* FIX: Corrected property name from `studentName` to `student_name`. */}
                                    <td className="px-6 py-4 whitespace-nowrap">{invoice.student_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{invoice.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    {/* FIX: Corrected property name from `dueDate` to `due_date`. */}
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <ProtectedComponent requiredPermission='edit_invoices'>
                                                <button onClick={() => setEditingInvoice(invoice)} className="text-brand-primary hover:text-sky-700" title="Editar">
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                            </ProtectedComponent>
                                             <ProtectedComponent requiredPermission='delete_invoices'>
                                                <button onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-500 hover:text-red-700" title="Excluir">
                                                    <Trash2Icon className="w-5 h-5" />
                                                </button>
                                            </ProtectedComponent>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'revenues':
                return <RevenuesTable revenues={revenues} onEdit={setEditingRevenue} onDelete={handleDeleteRevenue} />;
            case 'expenses':
                return <ExpensesTable expenses={expenses} onEdit={setEditingExpense} onDelete={handleDeleteExpense} />;
            default:
                return null;
        }
    };


    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-brand-text-dark">Gestão Financeira</h2>
                    {renderHeaderButton()}
                </div>
                
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto pb-2" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`${activeTab === 'invoices' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Faturas
                        </button>
                        <button
                            onClick={() => setActiveTab('revenues')}
                            className={`${activeTab === 'revenues' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Receitas
                        </button>
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`${activeTab === 'expenses' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Despesas
                        </button>
                    </nav>
                </div>
                
                <div className="overflow-x-auto">
                    {renderTabContent()}
                </div>
            </Card>

            <AddInvoiceModal
                isOpen={isAddInvoiceModalOpen}
                onClose={() => setAddInvoiceModalOpen(false)}
                onAddInvoice={handleAddInvoiceSubmit}
                students={activeStudents}
            />

            {editingInvoice && (
                 <EditInvoiceModal
                    isOpen={!!editingInvoice}
                    onClose={() => setEditingInvoice(null)}
                    invoice={editingInvoice}
                    onUpdateInvoice={handleUpdateInvoiceSubmit}
                />
            )}
            
            <AddRevenueModal
                isOpen={isAddRevenueModalOpen}
                onClose={() => setAddRevenueModalOpen(false)}
                onAddRevenue={handleAddRevenueSubmit}
            />
            
            <AddExpenseModal
                isOpen={isAddExpenseModalOpen}
                onClose={() => setAddExpenseModalOpen(false)}
                onAddExpense={handleAddExpenseSubmit}
            />

            {editingExpense && (
                <EditExpenseModal
                    isOpen={!!editingExpense}
                    onClose={() => setEditingExpense(null)}
                    expense={editingExpense}
                    onUpdateExpense={handleUpdateExpenseSubmit}
                />
            )}

            {editingRevenue && (
                 <EditRevenueModal
                    isOpen={!!editingRevenue}
                    onClose={() => setEditingRevenue(null)}
                    revenue={editingRevenue}
                    onUpdateRevenue={handleUpdateRevenueSubmit}
                />
            )}
        </>
    );
};

export default Financials;
