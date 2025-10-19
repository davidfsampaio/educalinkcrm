

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
// FIX: Corrected import path for types.
import { Invoice, PaymentStatus, Payment } from '../../types';

interface EditInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
    onUpdateInvoice: (invoice: Invoice) => void;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({ isOpen, onClose, invoice, onUpdateInvoice }) => {
    const [localInvoice, setLocalInvoice] = useState<Invoice>(invoice);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<'Boleto' | 'PIX' | 'Cartão de Crédito'>('PIX');

    useEffect(() => {
        setLocalInvoice(invoice);
    }, [invoice]);
    
    const totalPaid = localInvoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = localInvoice.amount - totalPaid;

    const handleAddPayment = () => {
        if (!paymentAmount || paymentAmount <= 0 || paymentAmount > remainingAmount) {
            alert('Valor do pagamento inválido.');
            return;
        }

        const newPayment: Payment = {
            id: Date.now(),
            amount: paymentAmount,
            date: paymentDate,
            method: paymentMethod,
        };
        
        const updatedPayments = [...localInvoice.payments, newPayment];
        const newTotalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        
        let newStatus = localInvoice.status;
        if (newTotalPaid >= localInvoice.amount) {
            newStatus = PaymentStatus.Paid;
        }

        setLocalInvoice(prev => ({
            ...prev,
            payments: updatedPayments,
            status: newStatus,
            // FIX: Corrected property name from `paidDate` to `paid_date`.
            paid_date: newStatus === PaymentStatus.Paid ? new Date().toISOString().split('T')[0] : prev.paid_date
        }));

        // Reset payment form
        setPaymentAmount('');
    };

    const handleSaveChanges = () => {
        onUpdateInvoice(localInvoice);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Fatura ${invoice.id}`} size="3xl">
            <div className="space-y-6">
                {/* Invoice Summary */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                    <h3 className="font-bold text-lg text-brand-text-dark mb-2">Resumo da Fatura</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="font-semibold text-brand-text-light">Aluno</p>
                            {/* FIX: Corrected property name from `studentName` to `student_name`. */}
                            <p className="text-brand-text-dark">{localInvoice.student_name}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-brand-text-light">Valor Total</p>
                            <p className="text-brand-text-dark font-mono">{localInvoice.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-brand-text-light">Total Pago</p>
                            <p className="text-green-600 font-mono">{totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                         <div>
                            <p className="font-semibold text-brand-text-light">Saldo Devedor</p>
                            <p className="text-red-600 font-mono">{remainingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div>
                    <h4 className="font-bold text-brand-text-dark mb-2">Histórico de Pagamentos</h4>
                    {localInvoice.payments.length > 0 ? (
                        <ul className="divide-y divide-gray-200 border rounded-md">
                            {localInvoice.payments.map(p => (
                                <li key={p.id} className="p-3 flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-semibold text-brand-text-dark">{p.method}</p>
                                        <p className="text-brand-text-light">Data: {new Date(p.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                    </div>
                                    <p className="font-mono text-brand-text-dark">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-500">Nenhum pagamento registrado.</p>
                    )}
                </div>

                {/* Add Payment Form */}
                {remainingAmount > 0 && (
                    <div className="pt-4 border-t">
                        <h4 className="font-bold text-brand-text-dark mb-2">Registrar Novo Pagamento</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                             <div>
                                <label htmlFor="pay-amount" className="block text-sm font-medium text-gray-700">Valor</label>
                                <input type="number" id="pay-amount" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                            <div>
                                <label htmlFor="pay-method" className="block text-sm font-medium text-gray-700">Método</label>
                                <select id="pay-method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                    <option>PIX</option>
                                    <option>Boleto</option>
                                    <option>Cartão de Crédito</option>
                                </select>
                            </div>
                            <button onClick={handleAddPayment} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-teal-600 transition-colors">
                                Adicionar Pagamento
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onClick={handleSaveChanges} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditInvoiceModal;