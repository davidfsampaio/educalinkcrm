import React from 'react';
import { Revenue } from '../../types';

interface RevenuesTableProps {
    revenues: Revenue[];
}

const RevenuesTable: React.FC<RevenuesTableProps> = ({ revenues }) => {
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-brand-text-dark">
                {revenues.map((revenue) => (
                    <tr key={revenue.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(revenue.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{revenue.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{revenue.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                           + {revenue.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default RevenuesTable;