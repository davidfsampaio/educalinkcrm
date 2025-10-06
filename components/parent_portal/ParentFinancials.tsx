
import React from 'react';
import { Invoice, PaymentStatus } from '../../types';
import Card from '../common/Card';

const getStatusClass = (status: PaymentStatus) => {
    switch(status) {
        case PaymentStatus.Paid: return 'bg-green-100 text-green-800';
        case PaymentStatus.Pending: return 'bg-yellow-100 text-yellow-800';
        case PaymentStatus.Overdue: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const ParentFinancials: React.FC<{ invoices: Invoice[], studentName: string }> = ({ invoices, studentName }) => {
    return (
        <Card>
            <h1 className="text-2xl font-bold text-brand-text-dark mb-4">Financeiro - {studentName}</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura ID</th>
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
                                <td className="px-6 py-4 whitespace-nowrap">{invoice.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-sm font-semibold text-brand-primary hover:text-sky-700">Ver Detalhes</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default ParentFinancials;
