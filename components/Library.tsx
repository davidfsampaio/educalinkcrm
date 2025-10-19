import React from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';

const Library: React.FC = () => {
    const { libraryBooks } = useData();

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4">Gestão da Biblioteca</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emprestado para</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-brand-text-dark">
                        {libraryBooks.map((book) => (
                            <tr key={book.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{book.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{book.status}</td>
                                {/* FIX: Corrected property name from `borrowedBy.studentName` to `borrowed_by.student_name`. */}
                                <td className="px-6 py-4 whitespace-nowrap">{book.borrowed_by?.student_name || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default Library;