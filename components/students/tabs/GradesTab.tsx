
import React from 'react';
import { Grade } from '../../../types';
import ProtectedComponent from '../../common/ProtectedComponent';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

interface GradesTabProps {
    grades: Grade[];
    onAdd: () => void;
}

const GradesTab: React.FC<GradesTabProps> = ({ grades, onAdd }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-text-dark">Notas</h3>
                <ProtectedComponent requiredPermission='edit_students'>
                    <button 
                        onClick={onAdd}
                        className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Nota
                    </button>
                </ProtectedComponent>
            </div>
            {grades.length === 0 ? (
                <p className="text-brand-text-dark">Nenhuma nota registrada para este aluno.</p>
            ) : (
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
            )}
        </div>
    );
};

export default GradesTab;
