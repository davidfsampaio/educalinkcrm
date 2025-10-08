
import React from 'react';
import { Attendance } from '../../../types';
import ProtectedComponent from '../../common/ProtectedComponent';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

interface AttendanceTabProps {
    attendance: Attendance[];
    onAdd: () => void;
}

const getStatusClass = (status: string) => {
    switch(status) {
        case 'Presente': return 'bg-green-100 text-green-800';
        case 'Ausente': return 'bg-red-100 text-red-800';
        case 'Justificado': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const AttendanceTab: React.FC<AttendanceTabProps> = ({ attendance, onAdd }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-text-dark">Frequência</h3>
                <ProtectedComponent requiredPermission='edit_students'>
                    <button 
                        onClick={onAdd}
                        className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Frequência
                    </button>
                </ProtectedComponent>
            </div>
            {attendance.length === 0 ? (
                <p className="text-brand-text-dark">Nenhum registro de frequência encontrado.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-brand-text-dark">
                            {attendance.map((record, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AttendanceTab;
