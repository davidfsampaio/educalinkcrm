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

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const Trash2Icon: React.FC<{className?: string}> = ({ className }) => (
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

const Financials: React.FC = () => {
    const { 
        invoices: initialInvoices, 
        students, 
        expenses: initialExpenses,
        revenues: initialRevenues,
        loading 
    } = useData();
    const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);
    const [localExpenses, setLocalExpenses] = useState<Expense[]>([]);
    const [localRevenues, setLocalRevenues] = useState<Revenue[]>([]);

    const [activeTab, setActiveTab] = useState<FinancialsTab>('invoices');
    
    const [isAddInvoiceModalOpen, setAddInvoiceModalOpen] = useState(false);
    const [isAddExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
    const [isAddRevenueModalOpen, setAddRevenueModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        if (!loading) {
            setLocalInvoices(initialInvoices);
            setLocalExpenses(initialExpenses);
            setLocalRevenues(initialRevenues);
        }
    }, [initialInvoices, initialExpenses, initialRevenues, loading]);

    const handleAddInvoice = (newInvoiceData: Omit<Invoice, 'id' | 'status' | 'payments' | 'studentName'> & { studentId: number }) => {
        const student = students.find(s => s.id === newInvoiceData.studentId);
        if (!student) return;

        const newInvoice: Invoice = {
            id: `INV-${Date.now()}`,
            ...newInvoiceData,
            studentName: student.name,
            status: new Date(newInvoiceData.dueDate) < new Date() ? PaymentStatus.Overdue : PaymentStatus.Pending,
            payments: [],
        };
        setLocalInvoices(prev => [newInvoice, ...prev]);
        setAddInvoiceModalOpen(false);
    };

    const handleUpdateInvoice = (updatedInvoice: Invoice) => {
        setLocalInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
        setEditingInvoice(null);
    };

    const handleDeleteInvoice = (invoiceId: string) => {
        if (window.confirm('Tem certeza de que deseja excluir esta fatura? Esta ação não pode ser desfeita.')) {
            setLocalInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
        }
    };
    
    const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
        const newExpense: Expense = {
            id: Date.now(),
            ...newExpenseData,
        };
        setLocalExpenses(prev => [newExpense, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setAddExpenseModalOpen(false);
    };
    
    const handleAddRevenue = (newRevenueData: Omit<Revenue, 'id'>) => {
        const newRevenue: Revenue = {
            id: Date.now(),
            ...newRevenueData,
        };
        setLocalRevenues(prev => [newRevenue, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setAddRevenueModalOpen(false);
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
                            {localInvoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{invoice.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{invoice.studentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{invoice.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
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
                return <RevenuesTable revenues={localRevenues} />;
            case 'expenses':
                return <ExpensesTable expenses={localExpenses} />;
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
                onAddInvoice={handleAddInvoice}
                students={activeStudents}
            />

            {editingInvoice && (
                 <EditInvoiceModal
                    isOpen={!!editingInvoice}
                    onClose={() => setEditingInvoice(null)}
                    invoice={editingInvoice}
                    onUpdateInvoice={handleUpdateInvoice}
                />
            )}
            
            <AddRevenueModal
                isOpen={isAddRevenueModalOpen}
                onClose={() => setAddRevenueModalOpen(false)}
                onAddRevenue={handleAddRevenue}
            />
            
            <AddExpenseModal
                isOpen={isAddExpenseModalOpen}
                onClose={() => setAddExpenseModalOpen(false)}
                onAddExpense={handleAddExpense}
            />
        </>
    );
};

export default Financials;