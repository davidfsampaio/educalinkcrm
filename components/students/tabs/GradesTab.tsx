
import React from 'react';
// FIX: Corrected import path for types.
import { Grade } from '../../../types';

interface GradesTabProps {
    grades: Grade[];
}

const GradesTab: React.FC<GradesTabProps> = ({ grades }) => {
    if (grades.length === 0) {
        return <p className="text-brand-text-dark">Nenhuma nota registrada para este aluno.</p>;
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disciplina</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-brand-text-dark">
                    {grades.map((grade, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">{grade.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{grade.term}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{grade.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-brand-primary">{grade.score.toFixed(1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GradesTab;
