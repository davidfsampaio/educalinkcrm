import React, { useRef, useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../contexts/DataContext';
import { PhotoAlbum, Photo } from '../../types';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const XIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);


interface AlbumDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    album: PhotoAlbum;
}

const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({ isOpen, onClose, album: initialAlbum }) => {
    const { photoAlbums, addPhotoToAlbum, deletePhotoFromAlbum } = useData();
    const [album, setAlbum] = useState(initialAlbum);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // This effect ensures that the photos in the modal update when one is added or deleted.
    useEffect(() => {
        const updatedAlbum = photoAlbums.find(a => a.id === initialAlbum.id);
        if (updatedAlbum) {
            setAlbum(updatedAlbum);
        }
    }, [photoAlbums, initialAlbum.id]);


    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const caption = prompt('Digite uma legenda para a foto (opcional):', file.name) || '';

            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result as string;
                addPhotoToAlbum(album.id, { url, caption });
            };
            reader.readAsDataURL(file);
        }
        // Reset file input to allow uploading the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleDeletePhoto = (photoId: number) => {
        if (window.confirm('Tem certeza de que deseja excluir esta foto?')) {
            deletePhotoFromAlbum(album.id, photoId);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={album.title} size="5xl">
            <div className="space-y-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    className="hidden"
                    accept="image/*"
                />
                 <div className="flex justify-between items-center">
                    <p className="text-brand-text-light">
                        {new Date(album.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} - {album.photos.length} fotos
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Foto
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
                    {album.photos.map(photo => (
                        <div key={photo.id} className="group relative rounded-lg overflow-hidden border">
                            <img src={photo.url} alt={photo.caption} className="h-48 w-full object-cover" />
                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex flex-col justify-between p-2">
                                <button
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="absolute top-2 right-2 bg-red-600/80 text-white p-1 rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Excluir foto"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                                <p className="text-white text-xs font-semibold self-end w-full bg-black/50 p-2 rounded-md translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    {photo.caption}
                                </p>
                            </div>
                        </div>
                    ))}
                     {album.photos.length === 0 && (
                        <div className="col-span-full text-center py-12 text-brand-text-light">
                            <p>Este álbum ainda não tem fotos.</p>
                            <p>Clique em "Adicionar Foto" para começar.</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AlbumDetailModal;