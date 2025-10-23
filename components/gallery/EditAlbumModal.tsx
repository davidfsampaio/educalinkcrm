import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../contexts/DataContext';
import { PhotoAlbum } from '../../types';

interface EditAlbumModalProps {
    isOpen: boolean;
    onClose: () => void;
    album: PhotoAlbum;
}

const EditAlbumModal: React.FC<EditAlbumModalProps> = ({ isOpen, onClose, album }) => {
    const { updatePhotoAlbum } = useData();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (album) {
            setTitle(album.title);
            setDate(album.date);
        }
    }, [album]);

    const handleSubmit = () => {
        if (!title || !date) {
            setError('Título e data são obrigatórios.');
            return;
        }
        
        const updatedAlbum: Omit<PhotoAlbum, 'school_id' | 'photos'> = { id: album.id, title, date, cover_url: album.cover_url };
        updatePhotoAlbum(updatedAlbum);

        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Álbum de Fotos">
            <div className="space-y-4">
                 {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Título do Álbum</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Data</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditAlbumModal;