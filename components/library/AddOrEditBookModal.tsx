import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { LibraryBook } from '../../types';

interface AddOrEditBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bookData: Omit<LibraryBook, 'id' | 'school_id'>) => void;
    book: LibraryBook | null;
}

const AddOrEditBookModal: React.FC<AddOrEditBookModalProps> = ({ isOpen, onClose, onSave, book }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isbn, setIsbn] = useState('');
    const [status, setStatus] = useState<'Disponível' | 'Emprestado' | 'Em Manutenção'>('Disponível');
    const [error, setError] = useState('');

    useEffect(() => {
        if (book) {
            setTitle(book.title);
            setAuthor(book.author);
            setIsbn(book.isbn);
            setStatus(book.status);
        } else {
            setTitle('');
            setAuthor('');
            setIsbn('');
            setStatus('Disponível');
        }
    }, [book, isOpen]);

    const handleSubmit = () => {
        if (!title || !author) {
            setError('Título e Autor são obrigatórios.');
            return;
        }

        onSave({ title, author, isbn, status });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={book ? 'Editar Livro' : 'Adicionar Novo Livro'}>
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Autor</label>
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ISBN</label>
                    <input type="text" value={isbn} onChange={e => setIsbn(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        <option>Disponível</option>
                        <option>Emprestado</option>
                        <option>Em Manutenção</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">
                        Salvar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddOrEditBookModal;