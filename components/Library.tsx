import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';
import { LibraryBook } from '../types';
import ProtectedComponent from './common/ProtectedComponent';
import AddOrEditBookModal from './library/AddOrEditBookModal';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const Trash2Icon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const Library: React.FC = () => {
    const { libraryBooks, addLibraryBook, updateLibraryBook, deleteLibraryBook } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);

    const handleOpenModal = (book: LibraryBook | null = null) => {
        setEditingBook(book);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingBook(null);
        setIsModalOpen(false);
    };

    const handleSaveBook = (bookData: Omit<LibraryBook, 'id' | 'school_id'>) => {
        if (editingBook) {
            updateLibraryBook({ ...editingBook, ...bookData });
        } else {
            addLibraryBook(bookData);
        }
        handleCloseModal();
    };

    const handleDeleteBook = (bookId: number) => {
        if (window.confirm('Tem certeza de que deseja excluir este livro do acervo?')) {
            deleteLibraryBook(bookId);
        }
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-brand-text-dark">Gestão da Biblioteca</h2>
                     <ProtectedComponent requiredPermission='manage_library'>
                        <button
                            onClick={() => handleOpenModal()}
                            className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Livro
                        </button>
                    </ProtectedComponent>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emprestado para</th>
                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-brand-text-dark">
                            {libraryBooks.map((book) => (
                                <tr key={book.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{book.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{book.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{book.borrowed_by?.student_name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <ProtectedComponent requiredPermission='manage_library'>
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => handleOpenModal(book)} className="text-brand-primary hover:text-sky-700" title="Editar">
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteBook(book.id)} className="text-red-500 hover:text-red-700" title="Excluir">
                                                    <Trash2Icon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </ProtectedComponent>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && (
                <AddOrEditBookModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveBook}
                    book={editingBook}
                />
            )}
        </>
    );
};

export default Library;