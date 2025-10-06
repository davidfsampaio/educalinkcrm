import React from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';

const Gallery: React.FC = () => {
    const { photoAlbums } = useData();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-brand-text-dark">Mural de Fotos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photoAlbums.map((album) => (
                    <Card key={album.id} className="p-0 overflow-hidden">
                        <img src={album.coverUrl} alt={album.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <h3 className="font-bold text-lg">{album.title}</h3>
                            <p className="text-sm text-gray-500">{album.date}</p>
                            <p className="text-sm text-gray-600 mt-2">{album.photos.length} fotos</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Gallery;
