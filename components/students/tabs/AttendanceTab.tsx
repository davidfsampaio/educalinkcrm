
import React from 'react';
// FIX: Corrected import path for types.
import { Attendance } from '../../../types';

interface AttendanceTabProps {
    attendance: Attendance[];
}

const getStatusClass = (status: string) => {
    switch(status) {
        case 'Presente': return 'bg-green-100 text-green-800';
        case 'Ausente': return 'bg-red-100 text-red-800';
        case 'Justificado': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const AttendanceTab: React.FC<AttendanceTabProps> = ({ attendance }) => {
     if (attendance.length === 0) {
        return <p className="text-brand-text-dark">Nenhum registro de frequência encontrado.</p>;
    }

    return (
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
    );
};

export default AttendanceTab;
