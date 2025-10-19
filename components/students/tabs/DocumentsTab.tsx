import React from 'react';
import { Document } from '../../../types';
import ProtectedComponent from '../../common/ProtectedComponent';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

interface DocumentsTabProps {
    documents: Document[];
    onAdd?: () => void;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ documents, onAdd }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-text-dark">Documentos</h3>
                {onAdd && (
                    <ProtectedComponent requiredPermission='edit_students'>
                        <button 
                            onClick={onAdd}
                            className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Documento
                        </button>
                    </ProtectedComponent>
                )}
            </div>
            {documents.length === 0 ? (
                <p className="text-brand-text-dark">Nenhum documento encontrado.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                        <li key={doc.id} className="py-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-brand-primary mr-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                <div>
                                    <p className="text-sm font-medium text-brand-text-dark">{doc.title}</p>
                                    {/* FIX: Corrected property name from `uploadDate` to `upload_date`. */}
                                    <p className="text-sm text-brand-text-dark">Upload em: {new Date(doc.upload_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                </div>
                            </div>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline text-sm font-semibold">
                                Visualizar
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DocumentsTab;