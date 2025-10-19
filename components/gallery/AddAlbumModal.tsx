import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../contexts/DataContext';
import { PhotoAlbum } from '../../types';

interface AddAlbumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddAlbumModal: React.FC<AddAlbumModalProps> = ({ isOpen, onClose }) => {
    const { addPhotoAlbum } = useData();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [coverUrl, setCoverUrl] = useState('');
    const [error, setError] = useState('');

    const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!title || !date || !coverUrl) {
            setError('Todos os campos, incluindo a foto de capa, são obrigatórios.');
            return;
        }
        
        // FIX: Corrected type to align with DataContext function signature.
        const newAlbumData: Omit<PhotoAlbum, 'id' | 'school_id' | 'photos'> = { title, date, coverUrl };
        addPhotoAlbum(newAlbumData);

        // Reset and close
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]);
        setCoverUrl('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Álbum de Fotos">
            <div className="space-y-4">
                 {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Título do Álbum</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Data</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Foto de Capa</label>
                    <div className="mt-1 flex items-center space-x-4">
                        {coverUrl ? <img src={coverUrl} alt="Preview da capa" className="h-20 w-20 object-cover rounded-md" /> : <div className="h-20 w-20 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">Preview</div>}
                        <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"/>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">
                        Criar Álbum
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddAlbumModal;