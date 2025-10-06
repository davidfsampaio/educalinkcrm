
import React from 'react';
// FIX: Corrected import path for types.
import { Document } from '../../../types';

interface DocumentsTabProps {
    documents: Document[];
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ documents }) => {
    if (documents.length === 0) {
        return <p className="text-brand-text-dark">Nenhum documento encontrado.</p>;
    }

    return (
        <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
                 <li key={doc.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        {/* FIX: Corrected malformed viewBox attribute in svg tag. The invalid attribute was viewBox="0 0 24" 24" */}
                        <svg className="w-6 h-6 text-brand-primary mr-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <div>
                            <p className="text-sm font-medium text-brand-text-dark">{doc.title}</p>
                            <p className="text-sm text-brand-text-dark">Upload em: {new Date(doc.uploadDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                        </div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline text-sm font-semibold">
                        Visualizar
                    </a>
                </li>
            ))}
        </ul>
    );
};

export default DocumentsTab;
