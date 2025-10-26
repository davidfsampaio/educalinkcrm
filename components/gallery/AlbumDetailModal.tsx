import React, { useRef, useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../contexts/DataContext';
import { PhotoAlbum } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedComponent from '../common/ProtectedComponent';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const XIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);


interface AlbumDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    album: PhotoAlbum;
}

interface PendingPhoto {
  file: File;
  previewUrl: string;
}

const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({ isOpen, onClose, album: initialAlbum }) => {
    const { photoAlbums, addPhotosToAlbum, deletePhotoFromAlbum } = useData();
    const { currentUser } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derive album state directly from context on each render to ensure it's always fresh.
    const album = photoAlbums.find(a => a.id === initialAlbum.id) || initialAlbum;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newPendingPhotos: PendingPhoto[] = Array.from(files).map((file: File) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setPendingPhotos(prev => [...prev, ...newPendingPhotos]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemovePendingPhoto = (previewUrlToRemove: string) => {
        setPendingPhotos(prev => {
            const photoToRemove = prev.find(p => p.previewUrl === previewUrlToRemove);
            if (photoToRemove) {
                URL.revokeObjectURL(photoToRemove.previewUrl);
            }
            return prev.filter(p => p.previewUrl !== previewUrlToRemove);
        });
    };
    
    const handleSaveChanges = async () => {
        if (pendingPhotos.length === 0 || !currentUser?.school_id) return;
        
        setIsSaving(true);
        setSuccessMessage(null);
        try {
            const uploadPromises = pendingPhotos.map(async ({ file }) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${currentUser.school_id}/${album.id}/${fileName}`;
                
                const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
                return { url: publicUrl, caption: file.name };
            });

            const newPhotosData = await Promise.all(uploadPromises);
            await addPhotosToAlbum(album.id, newPhotosData);
            
            pendingPhotos.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
            setPendingPhotos([]);
            setSuccessMessage(`${newPhotosData.length} foto(s) foram adicionada(s) ao álbum com sucesso!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error uploading photos:", error);
            alert(`Ocorreu um erro ao salvar as fotos: ${(error as Error).message}. Verifique se o bucket 'gallery' e suas permissões foram criados corretamente no painel do Supabase.`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseModal = () => {
        // Clean up any pending photos that weren't saved
        pendingPhotos.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
        setPendingPhotos([]);
        setIsSaving(false);
        setSuccessMessage(null);
        onClose();
    };

    const handleDeletePhoto = async (photoId: number) => {
        if (!window.confirm('Tem certeza de que deseja excluir esta foto?')) {
            return;
        }
        setSuccessMessage(null);
        try {
            const photoToDelete = album.photos.find(p => p.id === photoId);
            if (photoToDelete?.url) {
                const url = new URL(photoToDelete.url);
                const filePath = url.pathname.split('/gallery/')[1];

                if (filePath) {
                    const { error: removeError } = await supabase.storage.from('gallery').remove([filePath]);
                    if (removeError) console.warn("Could not delete file from storage, but will proceed.", removeError);
                }
            }
            await deletePhotoFromAlbum(album.id, photoId);
            setSuccessMessage('Foto excluída com sucesso!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch(error) {
            console.error("Error deleting photo:", error);
            alert(`Ocorreu um erro ao excluir a foto: ${(error as Error).message}`);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} title={album.title} size="5xl">
            <div className="space-y-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                    multiple
                    disabled={isSaving}
                />
                <div className="flex justify-between items-center">
                    <p className="text-brand-text-light">
                        {new Date(album.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} - {album.photos.length} fotos salvas
                    </p>
                    <ProtectedComponent requiredPermission='manage_gallery'>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSaving}
                            className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Fotos
                        </button>
                    </ProtectedComponent>
                </div>

                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md" role="alert">
                        <p className="font-semibold">{successMessage}</p>
                    </div>
                )}
                
                {pendingPhotos.length > 0 && (
                    <div className="p-3 bg-sky-100 border-y border-sky-200 flex justify-between items-center rounded-lg">
                        <span className="text-sm font-semibold text-sky-800">
                            {pendingPhotos.length} {pendingPhotos.length === 1 ? 'foto nova para salvar.' : 'fotos novas para salvar.'}
                        </span>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => {
                                    pendingPhotos.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
                                    setPendingPhotos([]);
                                }}
                                disabled={isSaving}
                                className="text-sm font-medium text-gray-700 hover:underline disabled:text-gray-400"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                className="flex items-center bg-brand-secondary text-white font-bold py-2 px-3 rounded-lg hover:bg-teal-500 transition-colors shadow-sm text-sm disabled:bg-slate-400"
                            >
                                {isSaving && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isSaving ? 'Salvando...' : 'Salvar Fotos'}
                            </button>
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
                    {/* Pending Photos */}
                    {pendingPhotos.map(photo => (
                        <div key={photo.previewUrl} className="group relative rounded-lg overflow-hidden border-2 border-dashed border-sky-400">
                            <img src={photo.previewUrl} alt={photo.file.name} className="h-48 w-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-between p-2">
                                <button
                                    onClick={() => handleRemovePendingPhoto(photo.previewUrl)}
                                    className="absolute top-2 right-2 bg-red-600/80 text-white p-1 rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remover foto"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                                <p className="text-white text-xs font-semibold self-end w-full bg-black/50 p-2 rounded-md truncate">
                                    {photo.file.name}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Saved Photos */}
                    {album.photos.map(photo => (
                        <div key={photo.id} className="group relative rounded-lg overflow-hidden border">
                            <img src={photo.url} alt={photo.caption} className="h-48 w-full object-cover" />
                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex flex-col justify-between p-2">
                                <ProtectedComponent requiredPermission='manage_gallery'>
                                    <button
                                        onClick={() => handleDeletePhoto(photo.id)}
                                        className="absolute top-2 right-2 bg-red-600/80 text-white p-1 rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Excluir foto"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </ProtectedComponent>
                                <p className="text-white text-xs font-semibold self-end w-full bg-black/50 p-2 rounded-md translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 truncate">
                                    {photo.caption}
                                </p>
                            </div>
                        </div>
                    ))}
                     {album.photos.length === 0 && pendingPhotos.length === 0 && (
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