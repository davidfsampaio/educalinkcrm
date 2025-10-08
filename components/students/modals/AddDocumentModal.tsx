
import React, { useState } from 'react';
import Modal from '../../common/Modal';
import { Document } from '../../../types';

interface AddDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (documentData: Omit<Document, 'id' | 'uploadDate'>) => void;
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!title || !file) {
            setError('O título e o arquivo são obrigatórios.');
            return;
        }
        
        // In a real app, you would upload the file and get a URL.
        // For this demo, we'll create a blob URL as a mock.
        const mockUrl = URL.createObjectURL(file);
        
        onAdd({ title, url: mockUrl });
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setFile(null);
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Novo Documento">
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título do Documento</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" placeholder="Ex: Certidão de Nascimento" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Arquivo</label>
                    <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"/>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">Adicionar Documento</button>
                </div>
            </div>
        </Modal>
    );
};

export default AddDocumentModal;
