import React, { useRef, useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../contexts/DataContext';
import { PhotoAlbum } from '../../types';
import { supabase } from '../../services/supabaseClient';

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
    const { photoAlbums, addPhotosToAlbum, deletePhotoFromAlbum } = useData();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derive album state directly from context on each render to ensure it's always fresh.
    const album = photoAlbums.find(a => a.id === initialAlbum.id) || initialAlbum;

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        setIsUploading(true);

        const uploadFileToStorage = async (file: File): Promise<{ url: string; caption: string; }> => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
            // Construct a unique path for the file in Supabase Storage
            const filePath = `${album.school_id}/${album.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('gallery') // Assuming a 'gallery' bucket exists
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('gallery')
                .getPublicUrl(filePath);
            
            if (!data.publicUrl) {
                throw new Error(`Could not get public URL for uploaded file: ${filePath}`);
            }

            return {
                url: data.publicUrl,
                caption: file.name,
            };
        };

        try {
            const newPhotosData = await Promise.all(Array.from(files).map(uploadFileToStorage));
            if (newPhotosData.length > 0) {
                await addPhotosToAlbum(album.id, newPhotosData);
            }
        } catch (error) {
            console.error("Error uploading files to storage:", error);
            alert(`Ocorreu um erro ao salvar as fotos: ${(error as Error).message}`);
        } finally {
            setIsUploading(false);
        }

        // Reset file input to allow uploading the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleDeletePhoto = async (photoId: number) => {
        const photoToDelete = album.photos.find(p => p.id === photoId);
        if (!photoToDelete) return;

        if (window.confirm('Tem certeza de que deseja excluir esta foto?')) {
            try {
                // First, remove the reference from the database
                await deletePhotoFromAlbum(album.id, photoId);

                // If the DB operation is successful, remove the file from storage.
                // This prevents orphan files if the DB operation fails.
                const url = new URL(photoToDelete.url);
                const pathParts = url.pathname.split('/gallery/');
                if (pathParts.length > 1) {
                    const filePath = decodeURIComponent(pathParts[1]);
                    const { error: deleteError } = await supabase.storage
                        .from('gallery')
                        .remove([filePath]);
                    
                    if (deleteError) {
                        // Log the error but don't block the user, as the DB record is already gone.
                        console.error("Failed to delete photo from storage, but DB record was removed:", deleteError);
                        alert("A foto foi removida do álbum, mas pode ter ocorrido um erro ao removê-la do armazenamento.");
                    }
                }
            } catch(error) {
                console.error("Error deleting photo:", error);
                alert(`Ocorreu um erro ao excluir a foto: ${(error as Error).message}`);
            }
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
                    multiple
                    disabled={isUploading}
                />
                 <div className="flex justify-between items-center">
                    <p className="text-brand-text-light">
                        {new Date(album.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} - {album.photos.length} fotos
                    </p>
                    <div className="flex items-center space-x-4">
                        {isUploading && (
                            <div className="flex items-center text-brand-text">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Carregando...</span>
                            </div>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            {isUploading ? 'Processando...' : 'Adicionar Fotos'}
                        </button>
                    </div>
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
                     {album.photos.length === 0 && !isUploading && (
                        <div className="col-span-full text-center py-12 text-brand-text-light">
                            <p>Este álbum ainda não tem fotos.</p>
                            <p>Clique em "Adicionar Fotos" para começar.</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AlbumDetailModal;