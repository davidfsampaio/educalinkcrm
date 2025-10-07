import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';
import AddAlbumModal from './gallery/AddAlbumModal';
import AlbumDetailModal from './gallery/AlbumDetailModal';
import { PhotoAlbum } from '../types';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const Trash2Icon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);


const Gallery: React.FC = () => {
    const { photoAlbums, deletePhotoAlbum } = useData();
    const [isAddAlbumModalOpen, setAddAlbumModalOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);

    const handleDelete = (e: React.MouseEvent, albumId: number) => {
        e.stopPropagation(); // Prevent modal from opening
        if (window.confirm('Tem certeza de que deseja excluir este álbum e todas as suas fotos? Esta ação não pode ser desfeita.')) {
            deletePhotoAlbum(albumId);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-brand-text-dark">Mural de Fotos</h2>
                 <button
                    onClick={() => setAddAlbumModalOpen(true)}
                    className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                 >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Criar Novo Álbum
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photoAlbums.map((album) => (
                    <Card key={album.id} className="p-0 overflow-hidden group cursor-pointer relative" onClick={() => setSelectedAlbum(album)}>
                        <img src={album.coverUrl} alt={album.title} className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-lg font-bold">Ver Álbum</span>
                        </div>

                        <button
                            onClick={(e) => handleDelete(e, album.id)}
                            className="absolute top-2 right-2 bg-red-600/80 text-white p-2 rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100"
                            title="Excluir álbum"
                        >
                            <Trash2Icon className="w-5 h-5" />
                        </button>
                        
                        <div className="p-4">
                            <h3 className="font-bold text-lg">{album.title}</h3>
                            <p className="text-sm text-gray-500">{new Date(album.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                            <p className="text-sm text-gray-600 mt-2">{album.photos.length} fotos</p>
                        </div>
                    </Card>
                ))}
            </div>

            <AddAlbumModal
                isOpen={isAddAlbumModalOpen}
                onClose={() => setAddAlbumModalOpen(false)}
            />
            
            {selectedAlbum && (
                <AlbumDetailModal
                    isOpen={!!selectedAlbum}
                    onClose={() => setSelectedAlbum(null)}
                    album={selectedAlbum}
                />
            )}
        </>
    );
};

export default Gallery;